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
        required: 'A pickup must have a location'
    },
    start: {
        type: Date,
        required: 'A pickup must have a start'
    },
    end: {
        type: Date,
        required: 'A pickup must have an end'
    },
    // pickup is open if checkouts can be made against it
    state: {
        type: String,
        enum: ['open', 'closed', 'ordered', 'complete'],
        required: 'A pickup must have a state'
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

