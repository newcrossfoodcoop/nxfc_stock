'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var	Schema = mongoose.Schema;

var AllocationSchema = new Schema({
	updated: {
		type: Date,
		default: Date.now
	},
	created: {
		type: Date,
		default: Date.now
	}
});

var Allocation = mongoose.model('Allocation', AllocationSchema);
