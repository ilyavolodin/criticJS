"use strict";

var launch = require("launchpad"),
	Q = require("q");

module.exports = {
	start: function(config) {
		var deferred = Q.defer();
		config.browsers.forEach(function(browser) {
			if (browser.type === "local") {
				launch.local(function(err, launcher) {
					if (err) {
						deferred.reject(err);
					} else {
						launcher(config.siteLocation, { browser: browser.name }, function(err, instance) {
							console.log("Starting " + browser.type + " " + browser.name + " " + instance.id);
							if (err) {
								console.log("Error: ", err);
								return;
							}
							instance.on("stop", function() {
								console.log("Closing " + browser.type + " " + browser.name);
							});
						});
					}
				});
			}
		});
		return deferred.promise;
	}
};