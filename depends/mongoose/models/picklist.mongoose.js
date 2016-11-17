'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var	Schema = mongoose.Schema;

var PicklistSchema = new Schema({
	updated: {
		type: Date,
		default: Date.now
	},
	created: {
		type: Date,
		default: Date.now
	}
});

var Picklist = mongoose.model('Picklist', PicklistSchema);
