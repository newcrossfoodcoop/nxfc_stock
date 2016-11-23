'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var	Schema = mongoose.Schema;

var StockSchema = new Schema({
    state: {
        type: String,
        enum: [
            'checkout', 'reserved', 'allocated', 'picked', 'held', 'ordered', 
            'pickedup', 'delivered', 'cancelled'
        ],
        required: true
    },
    productId: { 
        type: Schema.Types.ObjectId,
        required: true
    },
    supplierId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    checkout: {
        type: Schema.Types.ObjectId,
        ref: 'Checkout'
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order'
    },
    allocation: {
        type: Schema.Types.ObjectId,
        ref: 'Allocation'
    },
    reservation: {
        type: Schema.Types.ObjectId,
        ref: 'Reservation'
    },
    picklist: {
        type: Schema.Types.ObjectId,
        ref: 'Picklist'
    },
    supplierDelivery: {
        type: Schema.Types.ObjectId,
        ref: 'supplierDelivery'
    },
    pickup: {
        type: Schema.Types.ObjectId,
        ref: 'Pickup'
    },
    delivery: {
        type: Schema.Types.ObjectId,
        ref: 'Delivery'
    },
    location: {
        type: Schema.Types.ObjectId,
        ref: 'Location'
    },
    name: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        min: 1,
        required: true
    },
    updated: {
		type: Date,
		default: Date.now
	},
	created: {
		type: Date,
		default: Date.now
	},
});

/**
 * state: held, picked
 *   must have a location
 * state: checkout
 *   temporary state for stock in payment phase of checkout
 * state: reserved
 *   stock not held but paid for by a customer
 * state: ordered
 *   stock on order from a supplier
 * state: allocated
 *   stock paid for by customer and already held
 * state: pickedup
 *   stock collected by customer
 */


var Stock = mongoose.model('Stock', StockSchema);
