var glob = require('glob'),
    Q = require('q');

//this function is completely incorrect. It will return back the list of files
//as soon as it resolves the first glob. It should wait for all of them before
//returning values.
var resolveFiles = function(files) {
    var deferred = Q.defer();
    //var resolvedFiles = [];
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
        resolveFiles(files).then(function(data) {
            socket.emit('testFiles', JSON.stringify(data));
        });

        socket.on('browser-info', function (data) {
          console.log(data.browser);
        });

        //mocha events
        socket.on('start', function() {
            //start of the tests
            console.log("Mocha Start: " + JSON.stringify(arguments));
        });

        socket.on('end', function() {
            //end of the tests
            console.log("Mocha End: " + JSON.stringify(arguments));
        });

        socket.on('test', function() {
            //start of the test
            console.log("Mocha Test: " + JSON.stringify(arguments));
        });

        socket.on('fail', function() {
            //test failed
            console.log("Mocha Fail: " + JSON.stringify(arguments));
        });

        socket.on('test end', function() {
            //end of the test
            console.log("Mocha Test End: " + JSON.stringify(arguments));
        });
    }
};
