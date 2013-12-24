'use strict'

var colors = require("colors");

module.exports = function(results) {
    var output = "",
        total = 0,
        errors = 0;

    results.forEach(function(result) {
        total++;
        output += result.success ? (" ✓ " + result.description).green : (" ✖ " + result.description).red;
        errors += result.success ? 0 : 1;
        output += "\n";
    });

    if (total > 0) {
        output += "\n" + total + " tests. " + (total - errors) + " passed " + errors + " failed.";
    }
    return output;
};