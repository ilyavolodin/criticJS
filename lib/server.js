var http = require('http'),
    ios = require('socket.io'),
    fs = require('fs'),
    Q = require('q'),
    path = require('path'),
    logger = require('log4js').getLogger("log");

var handler = function(req, res) {
    var serveFile = function(err, data) {
        if (err) {
          res.writeHead(500);
          return res.end('Error loading file: ' + err);
        }
        res.writeHead(200);
        res.end(data);
    };

    switch(req.url.substr(0, req.url.lastIndexOf("?"))) {
        case "/q.js":
            fs.readFile(path.resolve(process.cwd() + '/node_modules/q/q.js'), serveFile);
            break;
        case "/assert.js":
            fs.readFile(path.resolve(process.cwd() + '/node_modules/tdd-assert/tdd-assert.js'), serveFile);
            break;
        case "/mocha.js":
            fs.readFile(path.resolve(process.cwd() + '/node_modules/mocha/mocha.js'), serveFile);
            break;
        default:
            if (req.url.indexOf('.js') > -1) {
                fs.readFile(path.resolve(process.cwd() + req.url.replace(/\?.*$/, '')), serveFile);
            } else {
                fs.readFile(path.resolve(process.cwd() + '/client/index.html'), serveFile);
            }
            break;
    }
};

module.exports = {
    start: function(config) {
        var deferred = Q.defer();
        var io;

        try {
            var server = http.createServer(handler);
            server.listen(config.port);
            logger.info("Server started on port " + config.port);
            io = ios.listen(server, {log: false});
            deferred.resolve(io.sockets);
        }
        catch(err) {
            deferred.reject(err);
        }
        return deferred.promise;
    }
};
