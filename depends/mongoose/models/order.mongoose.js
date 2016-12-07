'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var	Schema = mongoose.Schema;

var OrderSchema = new Schema({
    items: [{
        productId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        purchasePaid: {
            type: Number
        }
    }],
    state: {
        type: String,
        enum: ['created', 'placed', 'delivered'],
        default: 'created'
    },
    supplierId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    supplierOrderId: {
        type: Schema.Types.ObjectId,
        ref: 'Catalogue.Order'
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    deliveryMessage: {
        type: String,
        required: true
    },
    pickup: {
        type: Schema.Types.ObjectId,
        ref: 'Pickup'
    },
    delivery: {
        type: Schema.Types.ObjectId,
        ref: 'Delivery'
    },
	updated: {
		type: Date,
		default: Date.now
	},
	created: {
		type: Date,
		default: Date.now
	}
});

var Order = mongoose.model('Order', OrderSchema);
