"use strict";

var 
	//launch = require("launchpad"),
	server = require("./server"),
	// _ = require("lodash"),
	Q = require("q"),
	browser = require("./browser");


module.exports = {
	execute: function(config) {
		var deferred = Q.defer();
		server.start(config.server, config.tests.files).timeout(config.server.timeout).then(function(data) {
			deferred.resolve(data);
		}, function(error) {
			deferred.reject(error);
		});

		browser.start(config.browser).fail(function(data) {
			deferred.reject(data);
		});

		return deferred.promise;
	}
};