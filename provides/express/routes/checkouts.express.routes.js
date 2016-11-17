'use strict';

var checkouts = require('../controllers/checkouts.express.controller');

module.exports = function(app) {

	// checkouts Routes
	app.route('/api/checkouts')
	    .get(checkouts.list)
		.post(checkouts.create);

	app.route('/api/checkouts/:checkoutId')
		.get(checkouts.read)
		.put(checkouts.update)
		.delete(checkouts.delete);
		
	app.route('/api/checkouts/:checkoutId/confirm')
	    .get(checkouts.confirm);

	app.route('/api/checkouts/:checkoutId/cancel')
	    .get(checkouts.cancel);

	// Finish by binding the Product middleware
	app.param('checkoutId', checkouts.checkoutByID);
};
