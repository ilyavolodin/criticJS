var launch = require('launchpad'),
	server = require('./server'),
	_ = require("lodash"),
	Q = require("q");
	browser = require('./browser');


module.exports = {
	execute: function(config) {
		var deferred = Q.defer();
		server.start(config.server).timeout(config.server.timeout).then(function(data) {
			deferred.resolve(data);
		}, function(error) {
			deferred.reject(error);
		});

		browser.start(config.browser);

		return deferred.promise;
	}
};