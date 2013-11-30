var glob = require('glob'),
    Q = require('q');


var resolveFiles = function(files) {
    var deferred = Q.defer();
    //var resolvedFiles = [];
    files.forEach(function(file) {
        glob(file.pattern, function(err, resolvedFiles) {
            if (err) {
                deferred.reject(err);
            } else {
                resolvedFiles.forEach(function(resolved) {
                    resolvedFiles.push(resolved);
                });
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
        });

        socket.on('end', function() {
            //end of the tests
        });

        socket.on('test', function() {
            //start of the test
        });

        socket.on('fail', function() {
            //test failed
        });

        socket.on('test end', function() {
            //end of the test
        });
    }
};
