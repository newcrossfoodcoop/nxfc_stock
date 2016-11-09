'use strict';

module.exports = {
    nodeEnvShort: 'test',
    // Any services provided should be given different port numbers for test
	provides: {
		express: {
	        logging: null,
            port: 3041,
            externalUrl: {
                host: 'localhost:3001'
            },
        }
	}
};
