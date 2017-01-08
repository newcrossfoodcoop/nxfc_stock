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
		title: 'NXFC Stock',
		description: 'NXFC Stock Services',
		pkgjson: pkgjson
	},
    depends: {
        mongoose: {
            name: 'nxfc-stock',
            models: 'depends/mongoose/models/*.js'
        },
        catalogue: {},
        checkout: {}
    },
    provides: {
        express: {
            port: 3040,
            externalUrl: {
                href: 'http://localhost:3000'
            },
            env: {
                externalUrl: {
                    href: 'EXTERNAL_HREF'
                }
            }
        }
    }
};
