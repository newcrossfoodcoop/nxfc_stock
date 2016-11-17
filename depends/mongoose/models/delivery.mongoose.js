'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var	Schema = mongoose.Schema;

var DeliverySchema = new Schema({
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
            type: Number,
            required: true
        }
    }],
    supplierId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order'
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

var Delivery = mongoose.model('Delivery', DeliverySchema);
