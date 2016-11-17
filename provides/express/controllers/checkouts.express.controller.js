'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose');

var	Checkout = mongoose.model('Checkout'),
	Stock = mongoose.model('Stock'),
	Pickup = mongoose.model('Pickup');
	
var	_ = require('lodash');
var async = require('async');

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
        purchasePrice: item.purchasePrice,
        quantity: item.quantity
    });
    
    stock.save(function(err, doc) {
        if (err) { return cb(err); }
        checkout.items.push(doc);
        cb(null);
    });
}

function attachPickup(checkout, pickupId, cb) {
    if (!pickupId) { return cb(new Error('No pickup supplied')); }
    
    Pickup.findOne({ _id: pickupId }, function(err, pickup) {
        if (err) { return cb(err); }
        if (!pickup) { return cb(new Error('Pickup not found')); }
        
        if (pickup.state === 'open') {
            checkout.pickup = pickup;
            cb();
        }
        else {
            cb(new Error('Pickup not open'));
        }
    });
}

exports.create = function create (req,res) {
    
    var items = req.body.items;
    
	var checkout = new Checkout({ 
	    orderId: req.body.orderId
	});
	
	async.series([
	    _.partial(attachPickup, checkout, req.body.pickup),
	    checkout.save,
	    _.partial(async.eachSeries, items, _.partial(addStockItem, checkout)),
	    checkout.save
	],function(err, results) {
	    if (err) {
	        res.status(400).send({
				message: getErrorMessage(err)
			});
	    }
	    else {
	        res.json(checkout);
	    }
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
	    return res.send(400, {
			message: 'Can only confirm "new" checkouts'
		});
	}

    checkout.state = 'confirmed';
    
    new Promise((resolve, reject) => {
        async.eachSeries(
            checkout.items, 
            (item, cb) => { item.state = 'reserved'; item.save(cb); },
            (err) => { return err ? reject(err) : resolve(); }
        );
    })
    .then(checkout.save)
    .then(() => { res.jsonp(checkout); })
    .catch((err) => {
        res.send(400, { message: getErrorMessage(err) });
    });
};

/**
 * Change checkout state to 'cancelled' and update stock states
 */
exports.cancel = function(req, res) {
	var checkout = req.checkout ;

	if (checkout.state !== 'new') {
	    return res.send(400, {
			message: 'Can only cancel "new" checkouts'
		});
	}

    checkout.state = 'cancelled';
    
    new Promise((resolve, reject) => {
        async.eachSeries(
            checkout.items,
            (item, cb) => { item.state = 'cancelled'; item.save(cb); },
            (err) => { return err ? reject(err) : resolve(); }
        );
    })
    .then(checkout.save)
    .then(() => { res.jsonp(checkout); })
    .catch((err) => {
        res.send(400, { message: getErrorMessage(err) });
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
        .populate('items')
        .exec(function(err, checkout) {
		    if (err) return next(err);
		    if (! checkout) return next(new Error('Failed to load checkout ' + id));
		    req.checkout = checkout ;
		    next();
	    });
};
