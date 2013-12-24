#!/usr/bin/env node

'use strict';

var cli = require("../lib/cli"),
    argv = require("optimist")
        .usage('Usage: $0 -c [config]')
        .demand(['c'])
        .default('c', 'criticJS.json')
        .alias('config', 'c')
        .describe('c', 'Path to a configuration file')
        .argv,
    path = require("path"),
    existsSync = require("fs").existsSync || path.existsSync,
    _ = require("lodash"),
    Q = require("q"),
    log4js = require("log4js");

var resultCode = 0;

log4js.configure({
    appenders: [{ type: "console", category: "log" }]
});

var logger = log4js.getLogger("log");

if (argv.config && argv.config!==true) {
    var baseConfig = argv.config !== "criticJS.json" ? require(path.resolve("criticJS.json")) : {};
    var configPath = path.resolve(argv.config);
    if (existsSync(configPath)) {
        var config = _.merge(baseConfig, require(configPath));
        cli.execute(config).then(function(data) {
            //success
            process.exit(0);
        }, function(error) {
            //error
            logger.error(error);
            process.exit(1);
        });
    } else {
        logger.error("Config file not found at: " + argv.config);
        process.exit(1);
    }
}