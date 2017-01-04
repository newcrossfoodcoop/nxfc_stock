'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var	Schema = mongoose.Schema;

var PickupSchema = new Schema({
    description: {
        type: String
    },
    location: {
        type: Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    // pickup is open if checkouts can be made against it
    state: {
        type: String,
        enum: ['open', 'closed', 'ordered', 'complete'],
        required: true
    },
    orders: [{
        type: Schema.Types.ObjectId,
        ref: 'Order',
    }],
	updated: {
		type: Date,
		default: Date.now
	},
	created: {
		type: Date,
		default: Date.now
	}
});

var Pickup = mongoose.model('Pickup', PickupSchema);

