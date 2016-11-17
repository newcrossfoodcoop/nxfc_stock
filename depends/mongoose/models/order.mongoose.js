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
            type: Number,
            required: true
        }
    }],
    state: {
        type: 'string',
        enum: ['created', 'delivered'],
        default: 'created'
    },
    supplierId: {
        type: Schema.Types.ObjectId,
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
