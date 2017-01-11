'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const path = require('path');
const _ = require('lodash');
const async = require('async');
const thenify = require('thenify');
const util = require('util');
const assert = require('assert');

var	Checkout = mongoose.model('Checkout'),
	Stock = mongoose.model('Stock'),
	Pickup = mongoose.model('Pickup');
	
const checkoutOrdersApi = require(path.resolve('./depends/checkout')).api.resources.orders;

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = 'Checkout already exists';
				break;
			default:
				message = 'Something went wrong';
		}
	} else if (err.errors) {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	} else {
	    console.error(err.stack);
	    message = err.message;
	}

	return message;
};

/**
 * Create is not intended to be called from an untrusted source. It contains 
 * supplier and product ids that must be trusted.
 *
 * Currently assumes stock paid for should be reserved (ie. no stock held)
 */

function addStockItem(checkout, item, cb) {
    var stock = new Stock({
        checkout: checkout,
        state: 'checkout',
        productId: item.productId,
        supplierId: item.supplierId,
        pickup: checkout.pickup,
        price: item.price,
        cost: item.cost,
        name: item.name,
        quantity: item.quantity
    });
    
    stock.save(function(err, doc) {
        if (err) { return cb(err); }
        checkout.items.push(item);
        cb(null);
    });
}

//function attachPickup(checkout, pickupId, cb) {
//    if (!pickupId) { return cb(new Error('No pickup supplied')); }
//    
//    Pickup.findOne({ _id: pickupId }, function(err, pickup) {
//        if (err) { return cb(err); }
//        if (!pickup) { return cb(new Error('Pickup not found')); }
//        
//        if (pickup.state === 'open') {
//            checkout.pickup = pickup;
//            cb();
//        }
//        else {
//            cb(new Error('Pickup not open'));
//        }
//    });
//}

exports.create = function create (req,res) {
    
    var items = req.body.items;
    
	var checkout = new Checkout({ 
	    orderId: req.body.orderId,
	    user: req.body.user
	});
	
	Promise.resolve(req.body.pickup)
	.then((pickupId) => {
	    if (!pickupId) { throw new Error('No pickup supplied'); }
	    return Pickup.findOne({ _id: pickupId });
	})
	.then((pickup) => {
	    if (pickup.state === 'open') {
	        checkout.pickup = pickup;
	    }
	    else {
            throw(new Error('Pickup not open'));
        }
	})
	.then(() => {
	    if (!req.body.user) { throw new Error('No user supplied'); }
	    return checkout.save();
	})
	.then(() => {
	    return thenify(async.eachSeries)(items,_.partial(addStockItem, checkout));
	})
	.then(() => {
	    return checkout.save();
	})
	.then((doc) => { res.jsonp(doc); })
	.catch((err) => {
	    res.status(400).send({ message: getErrorMessage(err) });
	});

};

/**
 * Show the current checkout
 */
exports.read = function(req, res) {
	res.jsonp(req.checkout);
};

/**
 * Update a checkout
 */
exports.update = function(req, res) {
	var checkout = req.checkout ;

	checkout = _.extend(checkout , req.body);

	checkout.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(checkout);
		}
	});
};

/**
 * Change checkout state to 'confirmed' and update stock states
 */
exports.confirm = function(req, res) {
	var checkout = req.checkout ;

	if (checkout.state !== 'new') {
	    return res.status(400).send({
			message: 'Can only confirm "new" checkouts'
		});
	}

    checkout.state = 'confirmed';
    
    checkout
        .save()
        .then(() => {
            return Stock.find({checkout: checkout._id});
        })
        .then((items) => {
            return thenify(async.eachSeries)(
                items,(item, cb) => { item.state = 'reserved'; item.save(cb); }
            );
        })
        .then(() => { res.jsonp(checkout); })
        .catch((err) => {
            res.status(400).send({ message: getErrorMessage(err) });
        });
};

/**
 * Change checkout state to 'cancelled' and update stock states
 */
exports.cancel = function(req, res) {
	var checkout = req.checkout ;

	if (checkout.state !== 'new') {
	    return res.status(400).send({
			message: 'Can only cancel "new" checkouts'
		});
	}

    checkout.state = 'cancelled';
    
    checkout
        .save()
        .then(() => {
            return Stock.find({checkout: checkout._id});
        })
        .then((items) => {
            return thenify(async.eachSeries)(
                items,(item, cb) => { item.state = 'cancelled'; item.save(cb); }
            );
        })
        .then(() => { res.jsonp(checkout); })
        .catch((err) => {
            res.status(400).send({ message: getErrorMessage(err) });
        });
};

exports.stock = function(req, res) {
    var checkout = req.checkout;
    
    Stock
        .find({checkout: checkout._id})
        .then((results) => { res.jsonp(results); })
        .catch((err) => {
            res.send(400, { message: getErrorMessage(err) });
        });
};

exports.finalise = function(req, res) {
    var checkout = req.checkout;
    
    if (checkout.state !== 'confirmed') {
	    return res.status(400).send({
			message: 'Can only finalise "confirmed" checkouts'
		});
	}
	
	var items;
	
	Stock
	    .find({checkout: checkout._id})
	    .then((_items) => {
	        items = _items;
	        var instructions = [];
	        
	        _(items).each((item) => {
	            var instruction = {
	                productId : item.productId,
	                quantity: item.quantity,
	            };
	            
	            instructions.push(instruction);
	            
	            switch(item.state) {
	                case 'finalised':
	                    //nothing to do
	                    break;
	                case 'cancelled':
	                    instruction.action = 'cancel';
	                    break;
	                case 'pickedup':
	                case 'delivered':
	                case 'picked':
	                    instruction.action = 'finalise';
	                    item.state = 'finalised';
	                    break;
	                default:
	                    throw new Error(util.format('Cannot finalise "%s" stock',item.state));
	            }
	        });
	        
	        return checkoutOrdersApi.orderId(checkout.orderId).finalise.put(instructions)
	            .then((finalRes) => { 
	                assert.equal(
	                    finalRes.status,200,
	                    (finalRes.body ? 'Checkout: ' + finalRes.body.message : null)
	                ); 
	            });
	    })
	    .then(() => {         
            return thenify(async.eachSeries)(items, (item, cb) => { item.save(cb); });
	    })
	    .then(() => {
	        checkout.state = 'finalised';
	        return checkout.save();
	    })
	    .then(() => {
	        res.jsonp(checkout);
	    })
	    .catch((err) => {
            res.status(400).send({ message: getErrorMessage(err) });
        });
};

/**
 * Delete an checkout
 */
exports.delete = function(req, res) {
	var checkout = req.checkout ;

	checkout.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(checkout);
		}
	});
};

/**
 * List of checkouts
 */
exports.list = function(req, res) { 
    Checkout.find().sort('-created')
        .exec(function(err, checkouts) {
		    if (err) {
			    return res.send(400, {
				    message: getErrorMessage(err)
			    });
		    } else {
			    res.jsonp(checkouts);
		    }
	    });
};

/**
 * checkout middleware
 */
exports.checkoutByID = function(req, res, next, id) { 
    Checkout.findById(id)
        .exec(function(err, checkout) {
		    if (err) return next(err);
		    if (! checkout) return next(new Error('Failed to load checkout ' + id));
		    req.checkout = checkout ;
		    next();
	    });
};
