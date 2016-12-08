'use strict';

var hooks = require('hooks'),
    assert = require('assert');

var request = require('request');

var location;

hooks.before('GET /locations/{locationId} -> 200', function (test, done) {
    test.request.params.locationId = location._id;
    done();
});

hooks.after('POST /locations -> 200', function (test, done) {
    location = test.response.body;
    done();
});

var update_location;

hooks.after('POST /locations -> 200', function (test, done) {
    request.post(
        test.request.server + test.request.path,
        {form: test.request.body, json: true},
        function(err,res,bod) {
            update_location = bod;
            done();
        }
    );
});

hooks.before('PUT /locations/{locationId} -> 200', function (test, done) {
    test.request.params.locationId = update_location._id;
    done();
});
