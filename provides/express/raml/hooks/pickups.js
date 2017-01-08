'use strict';

var hooks = require('hooks'),
    assert = require('assert');

var request = require('request');
var randomstring = require('randomstring');
var _ = require('lodash');

var pickup, location;

// seed an extra location for pickup
hooks.after('POST /locations -> 200', function (test, done) {
    request.post(
        test.request.server + test.request.path,
        {form: test.request.body, json: true},
        function(err,res,bod) {
            location = bod;
            done(err);
        }
    );
});

hooks.before('GET /pickups/{pickupId} -> 200', function (test, done) {
    test.request.params.pickupId = pickup._id;
    done();
});

hooks.before('POST /pickups -> 200', function (test, done) {
    test.request.body.location = location._id;
    done();
});

hooks.after('POST /pickups -> 200', function (test, done) {
    pickup = test.response.body;
    done();
});

var close_pickup;
// seed an extra pickup for close
hooks.after('POST /pickups -> 200', function (test, done) {
    request.post(
        test.request.server + test.request.path,
        {form: test.request.body, json: true},
        function(err,res,bod) {
            close_pickup = bod;
            done(err);
        }
    );
});

hooks.before('GET /pickups/{pickupId}/close -> 200', function (test, done) {
    test.request.params.pickupId = close_pickup._id;
    done();
});

var order_pickup;
// seed an extra pickup for order
hooks.after('POST /pickups -> 200', function (test, done) {
    request.post(
        test.request.server + test.request.path,
        {form: test.request.body, json: true},
        function(err,res,bod) {
            order_pickup = bod;
            done(err);
        }
    );
});

var order_checkout;
// seed an extra checkout for order
hooks.after('POST /checkouts -> 200', function (test, done) {
    test.request.body.orderId = randomstring.generate({
        length: 24,
        charset: 'hex'
    });
    test.request.body.pickup = order_pickup._id;
    request.post(
        test.request.server + test.request.path,
        {form: test.request.body, json: true},
        function(err,res,bod) {
            order_checkout = bod;
            done(err);
        }
    );
});

// confirm checkout
hooks.after('POST /checkouts -> 200', function (test, done) {
    request.get(
        test.request.server + '/checkouts/'+ order_checkout._id +'/confirm',
        done
    );
});

// close pickup
hooks.after('POST /checkouts -> 200', function (test, done) {
    request.get(
        test.request.server + '/pickups/'+ order_pickup._id +'/close',
        done
    );
});

hooks.before('PUT /pickups/{pickupId}/orders -> 200', function (test, done) {
    test.request.params.pickupId = order_pickup._id;
    done();
});

hooks.before('GET /pickups/{pickupId}/orders -> 200', function (test, done) {
    test.request.params.pickupId = order_pickup._id;
    done();
});

hooks.before('GET /pickups/{pickupId}/checkouts -> 200', function (test, done) {
    test.request.params.pickupId = order_pickup._id;
    done();
});

hooks.after('GET /pickups/{pickupId}/checkouts -> 200', function (test, done) {
    _.each(test.response.body[0].stock, (entry) => {
        assert.equal(entry.state, 'reserved');  
    });
    done();
});

var put_pickup;
// seed an extra pickup for put
hooks.after('POST /pickups -> 200', function (test, done) {
    request.post(
        test.request.server + test.request.path,
        {form: test.request.body, json: true},
        function(err,res,bod) {
            put_pickup = bod;
            done(err);
        }
    );
});

hooks.before('PUT /pickups/{pickupId} -> 200', function (test, done) {
    test.request.params.pickupId = put_pickup._id;
    done();
});

var pickup_stock;
hooks.after('GET /pickups/{pickupId}/checkouts -> 200', (test, done) => {
    pickup_stock = test.response.body[0].stock[0];
    done();
});

hooks.before('PUT /pickups/{pickupId}/stocks/{stockId} -> 200', (test,done) => {
    test.request.params.pickupId = order_pickup._id;
    test.request.params.stockId = pickup_stock._id;
    done();
});

hooks.after('GET /pickups/{pickupId}/orders -> 200', function (test, done) {
    var order = test.response.body.orders[0];
    request.put(
        test.request.server + '/orders/' + order._id + '/delivered',
        done
    );
});

hooks.before('GET /pickups/{pickupId}/checkouts/{checkoutId}/finalise -> 200', (test, done) => {
    test.request.params.pickupId = order_pickup._id;
    test.request.params.checkoutId = pickup_stock.checkout;
    done();
});

hooks.before('GET /pickups/{pickupId}/archive -> 400', function (test, done) {
    test.request.params.pickupId = order_pickup._id;
    done();
});

hooks.before('GET /pickups/{pickupId}/archive -> 200', function (test, done) {
    test.request.params.pickupId = order_pickup._id;
    done();
});
