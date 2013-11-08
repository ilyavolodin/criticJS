#!/usr/bin/env node

/*
 * criticJS
 * https://github.com/ilyavolodin/criticJS
 *
 * Copyright (c) 2013 Ilya Volodin
 * Licensed under the MIT license.
 */

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
    Q = require("q");

var resultCode = 0;

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
			console.log(error);
			process.exit(1);
		});
	} else {
		console.log("Config file not found at: " + argv.config);
		process.exit(1);
	}
}