'use strict';

var orders = require('../controllers/orders.express.controller');

module.exports = function(app) {

	// orders Routes
	app.route('/api/orders')
	    .get(orders.list)
		.post(orders.create);

	app.route('/api/orders/:orderId')
		.get(orders.read)
		.put(orders.update)
		.delete(orders.delete);

    app.route('/api/orders/:orderId/delivered')
		.put(orders.delivered);

	// Finish by binding the Product middleware
	app.param('orderId', orders.orderByID);
};
