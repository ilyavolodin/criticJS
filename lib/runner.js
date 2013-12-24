var glob = require('glob'),
    Q = require('q'),
    logger = require("log4js").getLogger("log");

//this function is completely incorrect. It will return back the list of files
//as soon as it resolves the first glob. It should wait for all of them before
//returning values.
var resolveFiles = function(files) {
    var deferred = Q.defer();
    files.forEach(function(file) {
        glob(file.pattern, function(err, resolvedFiles) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(resolvedFiles);
            }
        });
    });
    return deferred.promise;
};

module.exports = {
    start: function(socket, files) {
        var deferred = Q.defer();
        var results = [];
        resolveFiles(files).then(function(data) {
            socket.emit('testFiles', JSON.stringify(data));
        });

        socket.on('browser-info', function (data) {
          logger.info(data.browser);
        });

        //mocha events
        //They shouldn't be outputing directly to console.
        //Instead they should add messages to internal array
        //and return it back. Then the array should be passed to
        //formatter that will output message in desired way.
        socket.on('start', function() {
            //start of the tests
            logger.info("Mocha Start: " + JSON.stringify(arguments));
        });

        socket.on('end', function() {
            //end of the tests
            logger.info("Mocha End: " + JSON.stringify(arguments));
            deferred.resolve(results);
        });

        socket.on('test end', function(result) {
            //end of the test
            results.push(result);
        });
        return deferred.promise;
    }
};
