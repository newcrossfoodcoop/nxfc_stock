'use strict';

var assert = require('assert');
var	_ = require('lodash');
var async = require('async');

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Pickup = mongoose.model('Pickup'),
	Stock = mongoose.model('Stock'),
	Order = mongoose.model('Order'),
	Checkout = mongoose.model('Checkout');

var ordersController = require('./orders.express.controller');

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

    Stock
        .aggregate([
            { $match: { pickup: pickup._id, state: 'reserved' } },
            { $group: {
                // TODO: price really should already be aggregated as total
                _id: { productId: '$productId', supplierId: '$supplierId', name: '$name', price: '$price' }, 
                quantity: { $sum: '$quantity' }
            } }
        ])
        .then((results) => {
            var orders = {};
            _.each(results, (result) => {
                var order = orders[result._id.supplierId];
                if (!order) {
                    var deliveryMessage = 'For delivery on: ' + new Date(pickup.start).toDateString();
                    order = 
                    orders[result._id.supplierId] = 
                        new Order({
                            supplierId: result._id.supplierId,
                            pickup: pickup._id,
                            deliveryMessage: deliveryMessage,
                            deliveryAddress: pickup.location.address
                        });
                }
                order.items.push({
                    productId: result._id.productId,
                    quantity: result.quantity,
                    purchasePaid: result._id.price * result.quantity 
                });
                
            });
            
            return orders;
        })
        .then((orders) => {
            return new Promise((resolve, reject) => {
                pickup.state = 'ordered';
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
        .then(() => {
            return new Promise((resolve, reject) => {
                async.eachSeries(pickup.orders, (order,cb) => {
                    ordersController
                        .place(order)
                        .then(() => {
                            return Stock.update({ 
                                pickup: pickup._id, 
                                supplierId: order.supplierId,
                                state: 'reserved'
                            },{
                                state: 'ordered'
                            },{
                                multi: true
                            });
                        })
                        .then(() => { cb(); })
                        .catch((err) => { cb(err); });
                },(err) => {
                    if (err) { return reject(err); }
                    resolve();
                });
            });
        })
        .then(() => { return Order.populate(pickup, {path: 'orders'}); })
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

exports.updateStock = (req, res) => {
    var stock = req.stock;
    var pickup = req.pickup;
    
//    if (pickup.state !== 'closed') {
//        return res.status(400).send({ message: 
//            'Pickup.state not closed, cannot modify stock' 
//        });
//    }
    
//    stock = _.extend(stock , req.body);
    stock.state = req.body.state;

	stock
	    .save()
	    .then(() => { res.jsonp(stock); })
	    .catch((err) => {
	        res.status(400).send({
				message: getErrorMessage(err)
			});
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
        .select('-orders')
        .populate('location')
        .exec(function(err, pickup) {
		    if (err) return next(err);
		    if (! pickup) return next(new Error('Failed to load pickup ' + id));
		    req.pickup = pickup ;
		    next();
	    });
};

exports.pickupStockByID = function(req, res, next, id) {
    if (!req.pickup) {
        return next(new Error('No pickup found, cannot get its stock'));
    }
    
    Stock
        .where({ _id : id, pickup: req.pickup._id })
        .findOne()
        .exec()
        .then((stock) => {
            assert(stock, 'Failed to load stock ' + id);
            req.stock = stock;
            next();
        })
        .catch(next);
};

exports.pickupByIDwithOrders = function(req, res, next, id) { 
    Pickup.findById(id)
        .populate('location')
        .populate('orders')
        .exec(function(err, pickup) {
		    if (err) return next(err);
		    if (! pickup) return next(new Error('Failed to load pickup ' + id));
		    req.pickup = pickup ;
		    next();
	    });
};
