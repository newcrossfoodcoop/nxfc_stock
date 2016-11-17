'use strict';

var locations = require('../controllers/locations.express.controller');

module.exports = function(app) {

	// locations Routes
	app.route('/api/locations')
	    .get(locations.list)
		.post(locations.create);

	app.route('/api/locations/:locationId')
		.get(locations.read)
		.put(locations.update)
		.delete(locations.delete);

	// Finish by binding the Product middleware
	app.param('locationId', locations.locationByID);
};
