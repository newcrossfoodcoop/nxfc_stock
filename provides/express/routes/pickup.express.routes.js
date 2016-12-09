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

	app.route('/api/pickups/:adminPickupId/orders')
	    .put(pickups.order)
		.get(pickups.read);

	app.route('/api/pickups/:pickupId/checkouts')
		.get(pickups.stockByCheckout);
		
	app.route('/api/pickups/:pickupId/stocks/:pickupStockId')
		.put(pickups.updateStock);

	// Finish by binding the Product middleware
	app.param('pickupId', pickups.pickupByID);
	app.param('pickupStockId', pickups.pickupStockByID);
	app.param('adminPickupId', pickups.pickupByIDwithOrders);
	
};
