'use strict';

var pickups = require('../controllers/pickups.express.controller');

module.exports = function(app) {

	// pickups Routes
	app.route('/api/pickups')
	    .get(pickups.list)
		.post(pickups.create);

	app.route('/api/pickups/:pickupId')
		.get(pickups.read)
		.put(pickups.update)
		.delete(pickups.delete);

	app.route('/api/pickups/:pickupId/close')
		.get(pickups.close);

	app.route('/api/pickups/:pickupId/order')
		.get(pickups.order);

	app.route('/api/pickups/:pickupId/checkouts')
		.get(pickups.stockByCheckout);

	// Finish by binding the Product middleware
	app.param('pickupId', pickups.pickupByID);
};
