"use strict";

var launch = require("launchpad"),
    Q = require("q"),
    logger = require("log4js").getLogger("log"),
    eventEmitter = require("events").EventEmitter,
    _ = require("lodash");

var instances = [];

var getId = function() {
    return 'xxxxxxxx-4xxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};

var browserLauncher = Object.create(new eventEmitter());
browserLauncher.start = function(config) {
    var deferred = Q.defer();
    config.browser.browsers.forEach(function(browser) {
        if (browser.type === "local") {
            launch.local(function(err, launcher) {
                if (err) {
                    deferred.reject(err);
                } else {
                    var browserId = getId();
                    launcher(config.browser.siteLocation + "?serverUrl=http://localhost:" + config.server.port + "&id=" + browserId, { browser: browser.name }, function(err, instance) {
                        logger.info("Starting " + browser.type + " " + browser.name + " " + instance.id);
                        browserLauncher.emit("start");
                        if (err) {
                            logger.error("Error: ", err);
                            return;
                        }
                        instances.push({ id: browserId, instance: instance });
                        deferred.resolve(browserId);
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
browserLauncher.stop = function(id) {
    var instance = instances.filter(function(item) {
        return item.id === id;
    });
    instance.forEach(function(instance) {
        instance.instance.stop();
    });
};

module.exports = browserLauncher;
