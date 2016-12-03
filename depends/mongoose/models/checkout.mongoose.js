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
    user: { 
        _id: { type: String, required: true },
        username: { type: String, required: true },
        displayName: { type: String, required: true },
        email: { type: String, required: true }
    },
    state: {
        type: String,
        enum: ['new', 'confirmed', 'cancelled'],
        default: 'new'
    },
    items: [{
        name: { 
            type: String,
            required: true 
        },
        cost: { type: Number },
        price: { type: Number },
        quantity: { 
            type: Number,
            required: true 
        },
        productId: { 
            type: Schema.Types.ObjectId, 
            required: true 
        },
        supplierId: { 
            type: Schema.Types.ObjectId, 
            required: true 
        }
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
