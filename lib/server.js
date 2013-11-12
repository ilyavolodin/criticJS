var http = require('http'),
  	ios = require('socket.io'),
  	fs = require('fs'),
  	Q = require('q'),
  	path = require('path'),
  	mm = require('minimatch'),
  	glob = require('glob');

var resolvedFiles = [];

function handler (req, res) {
	var serveFile = function(err, data) {
		if (err) {
		  res.writeHead(500);
		  return res.end('Error loading index.html');
		}
		res.writeHead(200);
		res.end(data);
	};
	if (req.url.indexOf('.js') > -1) {
		fs.readFile(path.resolve(process.cwd + req.url), serveFile);
	} else {
		fs.readFile(path.resolve(process.cwd + 'client/index.html'), serveFile);		
	}
}

function resolveFiles(files) {
	var resolvedFiles = [];
	files.forEach(function(file) {
		glob(file.pattern, function(err, resolvedFiles) {
			resolvedFiles.forEach(function(resolved) {
				resolvedFiles.push(resolved);
			});
		});
	});
}

module.exports = {
	start: function(config, files) {
		var deferred = Q.defer();

		try {
			var server = http.createServer(handler)
			server.listen(config.port);
			console.log("Server started on port " + config.port);

			var io = ios.listen(server);			
		}
		catch(err) {
			deferred.reject(err);
		}

		var result = {};

		resolveFiles(files);

		io.sockets.on('connection', function (socket) {
		  console.log('Connection detected');
		  //once connection is established start serving test files over to the client
		  socket.emit('testFiles', JSON.stringify(resolvedFiles));
		  socket.on('browser-info', function (data) {
		    console.log(data.browser);
		  });
		});

		io.sockets.on('disconnect', function (){
			console.log("Disconnected");
			deferred.resolve(result);
		});
		return deferred.promise;
	}
}