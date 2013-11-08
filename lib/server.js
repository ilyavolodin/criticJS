var http = require('http'),
  	ios = require('socket.io'),
  	fs = require('fs'),
  	Q = require('q');

function handler (req, res) {
   	res.writeHead(200);
	res.end("Ok");
}

module.exports = {
	start: function(config) {
		var deferred = Q.defer();

		try {
			var server = http.createServer(handler)
			server.listen(config.port);

			var io = ios.listen(server);			
		}
		catch(err) {
			deferred.reject(err);
		}

		var result = {};

		io.sockets.on('connection', function (socket) {
		  console.log('Connection detected');
		  socket.on('my other event', function (data) {
		    console.log(data);
		  });
		});

		io.sockets.on('disconnect', function (){
			console.log("Disconnected");
			deferred.resolve(result);
		});
		return deferred.promise;
	}
}