'use strict';

var pickups = require('../controllers/pickups.express.controller');

module.exports = function(app) {

	// pickups Routes
	app.route('/api/pickups')
	    .get(pickups.list)
		.post(pickups.create);
	
	app.route('/api/pickups/open')
	    .get(pickups.listOpen);
	    
	app.route('/api/pickups/active')
	    .get(pickups.listActive);

	app.route('/api/pickups/:pickupId')
		.get(pickups.read)
		.put(pickups.update)
		.delete(pickups.delete);

	app.route('/api/pickups/:pickupId/close')
		.get(pickups.close);
	
	app.route('/api/pickups/:pickupId/archive')
		.get(pickups.archive);

	app.route('/api/pickups/:adminPickupId/orders')
	    .put(pickups.order)
		.get(pickups.read);

	app.route('/api/pickups/:pickupId/checkouts')
		.get(pickups.stockByCheckout);
		
	app.route('/api/pickups/:pickupId/stocks/:pickupStockId')
		.put(pickups.updateStock);

	app.route('/api/pickups/:pickupId/checkouts/:pickupCheckoutId/finalise')
		.get(pickups.finaliseCheckout);

	// Finish by binding the Product middleware
	app.param('pickupId', pickups.pickupByID);
	app.param('pickupStockId', pickups.pickupStockByID);
	app.param('adminPickupId', pickups.pickupByIDwithOrders);
	app.param('pickupCheckoutId', pickups.pickupCheckoutByID);
	
};
