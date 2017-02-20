/**
 * 
 */
// lets go top down approach
// First we need an http server to hand over our static contents
// the requirement for the basic server is
var http = require("http");
var path = require("path");
var fs = require("fs");
var mime = require("mime");
var cache = {};

// lets create our http server
var server = http.createServer(function(request, response) {
	var absPath = "";
	if (request.url === "/") {
		absPath = 'public/index.html';
	} else {
		absPath = 'public' + request.url;
	}
	serveStaticContent(absPath, response);
});

function serveStaticContent(absPath, response) {
	if (cache[absPath]) {
		sendFileContent(absPath, response, cache[absPath]);
	} else {
		fs.exists(absPath, function(exists) {
			if (exists) {
				fs.readFile(absPath, function(err, data) {
					if (err) {
						send404Error(response);
					} else {
						cache[absPath] = data;
						sendFileContent(absPath, response, data);

					}
				})
			} else {
				send404Error(response);
			}
		});
	}
}

function sendFileContent(absPath, response, data) {
	response.writeHead(200, mime.lookup(path.basename(absPath)));
	response.end(data);
}

function send404Error(response) {
	response.writeHead(404, {
		'Content-Type' : 'text/plain'
	});
	response.end("Resouce not found");
}

server.listen(3000, function() {
	console.log("Server started");
});

// This server is currently meant only for Http
// now we convert it into sockets
var chat_server = require('./lib/chat_server');
chat_server.listen(server);
