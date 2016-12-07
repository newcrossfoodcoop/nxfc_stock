'use strict';

const _ = require('lodash');
const path = require('path');
const assert = require('assert');

/**
 * Module dependencies.
 */

const mongoose = require('mongoose'),
	Order = mongoose.model('Order'),
	Delivery = mongoose.model('Delivery'),
	Stock = mongoose.model('Stock');

const debug = require('debug')('provides:express:orders');

const ordersApi = require(path.resolve('./depends/catalogue')).api.resources.orders;

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = 'Order already exists';
				break;
			default:
				message = 'Something went wrong';
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
	var order = new Order(req.body);
	
	order.save(function(err, result) {
	    if (err) {
	        res.status(400).send({
				message: getErrorMessage(err)
			});
	    }
	    else {
	        res.json(order);
	    }
	});

};

/**
 * Show the current order
 */
exports.read = function(req, res) {
	res.jsonp(req.order);
};

/**
 * Update a order
 */
exports.update = function(req, res) {
	var order = req.order ;

	order = _.extend(order , req.body);

	order.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(order);
		}
	});
};

/**
 * Mark an order as delivered
 */
exports.delivered = (req, res) => {
    var order = req.order;
    
    var delivery = new Delivery({ 
        order: order,
        items: order.items,
        supplierId: order.supplierId
    });
    
    delivery.save()
        .then((doc) => {
            debug(delivery);
            order.state = 'delivered';
            order.delivery = doc;
            return order.save(); 
        })
        .then((doc) => {
            return Stock.update(
                {order: doc._id, state: 'ordered' }, 
                {$set: { state: 'delivered' }}
            );
        })
        .then(() => { return Order.populate(order, {path: 'delivery'}); })
        .then((doc) => { res.jsonp(doc); })
        .catch((err) => { 
            res.status(400).send({ message: getErrorMessage(err) });
        });
};

// Not being called by a route
exports.place = function(orderId) {
    var order;
    return Order
        .findById(orderId)
        .then((doc) => {
            order = doc;
            var items = _(order.items)
                .map((item) => {
                    return {
                        product: item.productId,
                        quantity: item.quantity,
                        purchasePaid: item.purchasePaid
                    };
                })
                .valueOf();
                
            return ordersApi.post({
                supplier: order.supplierId,
                items: items,
                stockOrderId: order._id,
                deliveryAddress: order.deliveryAddress,
                deliveryMessage: order.deliveryMessage
            });
        })
        .then((sres) => {
            assert.equal(sres.status,200,'Supplier order placement failed: ' + sres.body.message);
            order.state = 'placed';
            order.supplierOrderId = sres.body._id;
            return order.save();
        })
        .catch((err) => {
            console.error('PLACE ERROR', err.stack);
            throw err;
        });
};

/**
 * Delete an order
 */
exports.delete = function(req, res) {
	var order = req.order ;

	order.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(order);
		}
	});
};

/**
 * List of orders
 */
exports.list = function(req, res) { 
    Order.find().sort('-created')
        .exec(function(err, orders) {
		    if (err) {
			    return res.send(400, {
				    message: getErrorMessage(err)
			    });
		    } else {
			    res.jsonp(orders);
		    }
	    });
};

/**
 * order middleware
 */
exports.orderByID = function(req, res, next, id) { 
    Order.findById(id)
        .exec(function(err, order) {
		    if (err) return next(err);
		    if (! order) return next(new Error('Failed to load order ' + id));
		    req.order = order ;
		    next();
	    });
};
