'use strict';

/**
 * Module dependencies.
 */

exports.read = function read (req,res) {
    res.status(200).jsonp({ message: 'success' });
};
