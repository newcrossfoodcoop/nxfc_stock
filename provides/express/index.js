'use strict';

var path = require('path');
var config = require('config');

var express = require('./lib');
var mongoose = require(path.resolve('depends/mongoose'));

mongoose.connect(function (err, db) {   
    var app = express.init();

    // Start the app by listening on <port>
    var port = config.provides.express.port;
    app.listen(port);

    // Logging initialization
    console.log('Express started on port ' + port);
});
