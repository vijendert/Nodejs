/**
 * This file has the code for the fileserver As the name says the server should
 * be able to send file We have the package mime which is used to get the
 * content type using the file name We have used path package here so that from
 * the url in the we can drive the file name and its physical path
 */
// Reading the data file
var fs = require('fs');
// managing the path in the url and physical mapping of the file
var path = require('path');
// makes a server
var http = require('http');
// used to get content-type based on the file name/type
var mime = require('mime');
// used to cache the file for fast retrievals
var cache = {};

// Use case file not found on me the server
function send404(response) {
	response.writeHead(404, {
		'Content-Type' : 'text/plain'
	});
	response.write('Error 404 : Resource not found');
	response.end();
}
// This function actually send files
// well to send file I need the filename for sure
// where is the file
// and the content of the file
// and of course the response object
function sendFile(response, filePath, fileContent) {
	response.writeHead(200, {
		'Content-Type' : mime.lookup(path.basename(filePath))
	});
	response.end(fileContent);
}

// since this is server it needs to serve static
function serveStatic(response, cache, absPath) {
	if (cache[absPath]) {
		// found the data in cache send it
		// PAth here is only necessary to get the mime type of the file
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function(exists) {
			if (exists) {
				// Not in cache read the file
				fs.readFile(absPath, function(err, data) {

					if (err) {
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}

				});
			} else {
				send404(response);
			}
		});

	}
}

// Server will get a request. It will be for a file or for a html page
// server needs to send the file as response to the client.
// So let us see how http provide us a method to take the request
// Because it is from request that it al starts
// So htttp package provides us with a method which says createServer
// and the requestListener which is a function which gets the request and
// response object
// which we use to repsond back for a request
var server = http.createServer(function(request, response) {
	var filePath = false;
	if (request.url === "/") {
		filePath = 'public/index.html';
	} else {
		// request.url will get the string pass the host and port number
		// And probably without the parameters
		// So if the url is http://localhost:3000/xyz/abc.html
		// it should get xyz/abc.html
		filePath = 'public' + request.url;
	}
	var absPath = './' + filePath;
	// Got the file path mapped to physical path on the server
	// Time to send the file
	serveStatic(response, cache, absPath);
});

// /////////////////Following code is for our chat server///////////////////////

var chatserver = require('./lib/chat_server');
// we are passing our current server to the chatserver
// reason being our chat server which will use WebSocket
// Is going touse our server only to make a socket connection over
// http. Now this is possible because both have same way of handshaking.
// Though the way data is passed is different
chatserver.listen(server);

// Time to fire it up
server.listen(3000, function() {
	console.log("Server started on port 3000");
});
