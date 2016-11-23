'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Pickup = mongoose.model('Pickup'),
	Stock = mongoose.model('Stock'),
	Order = mongoose.model('Order'),
	Checkout = mongoose.model('Checkout');

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
				message = 'Pickup already exists';
				break;
			default:
				message = 'Something went wrong';
				console.error(err);
		}
	} else if (err.errors) {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	} else {
	    console.error(err);
	    message = 'Internal Error';
	}

	return message;
};

exports.create = function create (req,res) {
    
	var pickup = new Pickup(req.body);
	
	pickup.save(function(err, result) {
	    if (err) {
	        res.status(400).send({
				message: getErrorMessage(err)
			});
	    }
	    else {
	        res.json(pickup);
	    }
	});

};

/**
 * Show the current pickup
 */
exports.read = function(req, res) {
	res.jsonp(req.pickup);
};

/**
 * Update a pickup
 */
exports.update = function(req, res) {
	var pickup = req.pickup ;

	pickup = _.extend(pickup , req.body);

	pickup.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(pickup);
		}
	});
};

/**
 * Change pickup state to 'closed'
 */
exports.close = function(req, res) {
	var pickup = req.pickup;

	if (pickup.state !== 'open') {
	    return res.send(400, {
			message: 'Can only close an "open" pickup'
		});
	}

    pickup.state = 'closed';
    
    pickup.save()
        .then(() => { res.jsonp(pickup); })
        .catch((err) => { res.status(400).send({ message: getErrorMessage(err) }); });
};

/**
 * Create orders for each supplier in this pickup
 */
exports.order = (req, res) => {
	var pickup = req.pickup;

	if (pickup.state !== 'closed') {
	    return res.status(400).send({
			message: 'Can only order against a "closed" pickup'
		});
	}

    pickup.state = 'ordered';
    pickup.save()
        .then(() => {
            return Stock.aggregate([
                { $match: { pickup: pickup._id, state: 'checkout' } },
                { $group: { 
                    _id: { productId: '$productId', supplierId: '$supplierId' }, 
                    quantity: { $sum: '$quantity.amount' },
                    purchasePaid: { $sum: '$purchasePrice' }
                } }
            ]);
        })
        .then((results) => {
            var orders = {};
            _.each(results, (result) => {
                var order = orders[result._id.supplierId];
                if (!order) {
                    order = 
                        orders[result._id.supplierId] = 
                        new Order({
                            supplierId: result._id.supplierId,
                            pickup: pickup._id
                        });
                }
                order.items.push({
                    productId: result._id.productId,
                    quantity: result.quantity,
                    purchasePaid: result.purchasePaid
                });
                
            });
            
            return orders;
        })
        .then((orders) => {
            return new Promise((resolve, reject) => {
                async.eachSeries(_.values(orders), (order,cb) => {
                    pickup.orders.push(order);
                    order.save(cb);
                },(err) => {
                    if (err) { return reject(err); }
                    resolve();
                });
            });
        })
        .then(pickup.save)
        .then((doc) => { return Order.populate(doc, {path: 'orders'}); })
        .then((doc) => { res.jsonp(doc); })
        .catch((err) => { 
            res.status(400).send({ message: getErrorMessage(err) }); 
        });

};

exports.stockByCheckout = (req, res) => {
    var pickup = req.pickup;
    
    Stock
        .aggregate([
            { $match: { pickup: pickup._id } },
            { $sort: { created: 1 }},
            { $group: { _id: '$checkout', stock: { $push: '$$CURRENT'} }}
        ])
        .then((results) => {
            return Checkout.populate(
                results, { path: '_id', model: 'Checkout' }
            );
        })
        .then((results) => { res.jsonp(results); })
        .catch((err) => { 
            res.status(400).send({ message: getErrorMessage(err) }); 
        });
};


/**
 * Delete an pickup
 */
exports.delete = function(req, res) {
	var pickup = req.pickup ;

	pickup.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(pickup);
		}
	});
};

/**
 * List of pickups
 */
exports.list = function(req, res) { 
    Pickup.find()
        .select('-orders')
        .sort('-created')
        .populate('location')
        .exec(function(err, pickups) {
		    if (err) {
			    return res.send(400, {
				    message: getErrorMessage(err)
			    });
		    } else {
			    res.jsonp(pickups);
		    }
	    });
};

/**
 * pickup middleware
 */
exports.pickupByID = function(req, res, next, id) { 
    Pickup.findById(id)
        .populate('location')
        .exec(function(err, pickup) {
		    if (err) return next(err);
		    if (! pickup) return next(new Error('Failed to load pickup ' + id));
		    req.pickup = pickup ;
		    next();
	    });
};
