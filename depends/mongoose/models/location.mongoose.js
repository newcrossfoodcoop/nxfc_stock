'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var	Schema = mongoose.Schema;
var url = require('url');

var LocationSchema = new Schema({
    name: {
        type: String,
        required: 'A location must have a name'
    },
    description: {
        type: String
    },
    url: {
        type: String,
        validate: {
            validator: url.parse,
            message: '{VALUE} is not valid url'
        }
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

var Location = mongoose.model('Location', LocationSchema);
