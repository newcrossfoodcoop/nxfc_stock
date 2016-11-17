'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var	Schema = mongoose.Schema;

var CheckoutSchema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        required: 'External orderId must be provided',
        unique: true
    },
    state: {
        type: String,
        enum: ['new', 'confirmed', 'cancelled'],
        default: 'new'
    },
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'Stock'
    }],
    pickup: {
        type: Schema.Types.ObjectId,
        ref: 'Pickup'
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

var Checkout = mongoose.model('Checkout', CheckoutSchema);
