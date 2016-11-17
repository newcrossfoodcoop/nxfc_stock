'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Location = mongoose.model('Location'),
	_ = require('lodash');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = 'Location already exists';
				break;
			default:
				message = 'Something went wrong';
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};

exports.create = function create (req,res) {
	var location = new Location(req.body);
	
	location.save(function(err, result) {
	    if (err) {
	        res.status(400).send({
				message: getErrorMessage(err)
			});
	    }
	    else {
	        res.json(location);
	    }
	});

};

/**
 * Show the current location
 */
exports.read = function(req, res) {
	res.jsonp(req.location);
};

/**
 * Update a location
 */
exports.update = function(req, res) {
	var location = req.location ;

	location = _.extend(location , req.body);

	location.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(location);
		}
	});
};

/**
 * Delete an location
 */
exports.delete = function(req, res) {
	var location = req.location ;

	location.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(location);
		}
	});
};

/**
 * List of locations
 */
exports.list = function(req, res) { 
    Location.find().sort('-created')
        .exec(function(err, locations) {
		    if (err) {
			    return res.send(400, {
				    message: getErrorMessage(err)
			    });
		    } else {
			    res.jsonp(locations);
		    }
	    });
};

/**
 * location middleware
 */
exports.locationByID = function(req, res, next, id) { 
    Location.findById(id)
        .exec(function(err, location) {
		    if (err) return next(err);
		    if (! location) return next(new Error('Failed to load location ' + id));
		    req.location = location ;
		    next();
	    });
};
