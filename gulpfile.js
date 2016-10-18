'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
	gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	runSequence = require('run-sequence'),
	plugins = gulpLoadPlugins(),
	args = require('get-gulp-args')();

// Set NODE_ENV to 'test'
gulp.task('env:test', function () {
	process.env.NODE_ENV = 'test';
});

// Set NODE_ENV to 'development'
gulp.task('env:dev', function () {
	process.env.NODE_ENV = 'development';
});

// Set NODE_ENV to 'production'
gulp.task('env:prod', function () {
	process.env.NODE_ENV = 'production';
});

// Set NODE_ENV to 'stage'
gulp.task('env:stage', function () {
	process.env.NODE_ENV = 'stage';
});

// Nodemon task
gulp.task('nodemon', function () {
	return plugins.nodemon({
		script: 'server.js',
		nodeArgs: ['--debug'],
		ext: 'js,html',
		watch: _.union([])
	});
});

gulp.task('node', function () {
    var nodeArgs = ['server.js'];
    var spawn = require('child_process').spawn;
    console.log(args);
    
    _(['stack-size', 'debug', 'max_old_space_size'])
        .forEach(function(k) {
            var sk = 'spawn_' + k;
            if (!_.has(args,sk)) { return; }
            if (typeof(args[sk]) !== 'undefined') {nodeArgs.push( '--' + k + '=' + args[sk] );}
            else {nodeArgs.push('--' + k);}
        });
    console.log('spawning: node',nodeArgs);
    spawn('node', nodeArgs, {stdio: 'inherit'}); 
});

// JS linting task
gulp.task('jshint', function () {
	return gulp.src(_.union([]))
		.pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter('default'))
		.pipe(plugins.jshint.reporter('fail'));
});

// Mocha tests task
gulp.task('mocha', function (done) {
	var error;

	// Run the tests
	gulp.src(_.union([]))
		.pipe(plugins.mocha({
			reporter: 'spec',
			timeout: 4000
		}))
		.on('error', function (err) {
			// If an error occurs, save it
			error = err;
		})
		.on('end', function() {
			done(error);
		});

});

// Run the project linting
gulp.task('lint', function(done) {
	runSequence('jshint', done);
});

// Run the project tests
gulp.task('test', function(done) {
	runSequence('env:test', 'lint', 'mocha', done);
});

// Run the project in development mode
gulp.task('default', function(done) {
	runSequence('env:dev', 'lint', 'nodemon', done);
});

// Run the project in production mode
gulp.task('prod', function(done) {
	runSequence('env:prod', 'node', done);
});

// Run the project in stage mode
gulp.task('stage', function(done) {
	runSequence('env:stage', 'node', done);
});


