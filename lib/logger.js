require('colors');

var results = [];

module.exports = {
    logResult: function(result) {
        results.push(result);
        if (!result.success) {
            console.log((result.suite.join(' ') + ' ' + result.description).red);
            console.log(result.log.join(' '));
        } else {
            console.log((result.suite.join(' ') + ' ' + result.description).green);
        }
    }
};
