var http = require('http'),
      ios = require('socket.io'),
      fs = require('fs'),
      Q = require('q'),
      path = require('path'),
      runner = require('./runner');

var handler = function(req, res) {
    var serveFile = function(err, data) {
        if (err) {
          res.writeHead(500);
          return res.end('Error loading file: ' + err);
        }
        res.writeHead(200);
        res.end(data);
    };
    if (req.url.indexOf('.js') > -1) {
        fs.readFile(path.resolve(process.cwd() + req.url.replace(/\?.*$/, '')), serveFile);
    } else {
        fs.readFile(path.resolve(process.cwd() + '/client/index.html'), serveFile);
    }
};

module.exports = {
    start: function(config, files) {
        var deferred = Q.defer();
        var io;

        try {
            var server = http.createServer(handler);
            server.listen(config.port);
            console.log("Server started on port " + config.port);

            io = ios.listen(server);
        }
        catch(err) {
            deferred.reject(err);
        }

        var result = {};

        io.sockets.on('connection', function (socket) {
          console.log('Connection detected');
          runner.start(socket, files);
        });

        io.sockets.on('disconnect', function (){
            console.log("Disconnected");
            deferred.resolve(result);
        });
        return deferred.promise;
    }
};
