"use strict";

var launch = require("launchpad"),
    Q = require("q"),
    logger = require("log4js").getLogger("log"),
    eventEmitter = require("events").EventEmitter,
    _ = require("lodash");

var instances = [];

var browserLauncher = Object.create(new eventEmitter());
browserLauncher.start = function(config) {
    var deferred = Q.defer();
    config.browser.browsers.forEach(function(browser) {
        if (browser.type === "local") {
            launch.local(function(err, launcher) {
                if (err) {
                    deferred.reject(err);
                } else {
                    launcher(config.browser.siteLocation + "?serverUrl=http://localhost:" + config.server.port, { browser: browser.name }, function(err, instance) {
                        logger.info("Starting " + browser.type + " " + browser.name + " " + instance.id);
                        browserLauncher.emit("start");
                        if (err) {
                            logger.error("Error: ", err);
                            return;
                        }
                        instances.push(instance);
                        deferred.resolve();
                        instance.on("stop", function() {
                            browserLauncher.emit("end");
                            logger.info("Closing " + browser.type + " " + browser.name);
                            
                        });
                    });
                }
            });
        }
    });
    return deferred.promise;
}
browserLauncher.stop = function() {
    instances.forEach(function(instance) {
        instance.stop();
    });
};

module.exports = browserLauncher;
