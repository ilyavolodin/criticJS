"use strict";

var	server = require("./server"),
    Q = require("q"),
    browser = require("./browser"),
    runner = require("./runner"),
    logger = require("log4js").getLogger();

var loadFormatter = function(name) {
    var formatter,
        formatterPath = "./formatters/" + name;

    try {
        formatter = require(formatterPath);
        return formatter;
    } catch (e) {
        logger.error("Couldn't load formatter. " + e);
    }
}

var browsers = [];

module.exports = {
    execute: function(config) {
        var deferred = Q.defer();
        var openConnections = 0;
        server.start(config.server).then(function(socket) {
            //start socket listner here
            socket.on('connection', function (socket) {
                logger.info('Connection detected');
                runner.start(socket, config.tests.files).then(function(data) {
                    var formatter = loadFormatter(config.formatter);
                    if (formatter) {
                        console.log(formatter(data.results));
                        browser.stop(data.id);
                    }
                });
            });

            socket.on('disconnect', function (){
                logger.info("Disconnected");
            });

            browser.start(config).timeout(config.browser.timeout, "Failed to start browser within " + config.browser.timeout + "ms").then(function(instanceId) {
                browsers.push(instanceId);
            }).fail(function(data) {
                deferred.reject(data);
            });

            browser.on("start", function() {
                openConnections++;
            });

            browser.on("end", function() {
                openConnections--;
                if (!openConnections) {
                    deferred.resolve("Done");
                }
            });
        }, function(error) {
            logger.error(error);
        });

        return deferred.promise;
    }
};
