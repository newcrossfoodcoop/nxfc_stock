'use strict';

var config = require('config');
var path = require('path');
var lib = require(path.resolve('./lib/config'));

var myDefaultConfigs = {
    _url: lib.deferredSetUrl(),
    url: {
        protocol: 'http',
        slashes: true,
        hostname: 'localhost',
        pathname: 'api',
        port: 3030
    },
    env: {
        url: {
            hostname: 'CHECKOUT_HOSTNAME',
            href: 'CHECKOUT_HREF'
        }
    }
};

lib.processConfig({
    module: 'checkout',
    defaultConfig: myDefaultConfigs
});

module.exports = config;
