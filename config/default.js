'use strict';

var path = require('path');
var defer = require('config/defer').deferConfig;
var chalk = require('chalk');

var pkgjson = require(path.resolve('./package.json'));

module.exports = {
    nodeEnvShort: defer(function() {
        throw new Error(chalk.red('NODE_ENV value not recognised!'));
    }),
	repo: {
		title: 'NXFC Base',
		description: 'NXFC Base configuration',
		pkgjson: pkgjson
	},
    depends: {
    },
    provides: {
    }
};
