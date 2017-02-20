/**
 * http://usejsdoc.org/
 */
var net = require('net');
var events = require('events');
var channel = new events.EventEmitter();
channel.clients = {};
channel.subscriptions = {};
channel.on('join', function(id, client) {
	console.log('join ' + id);
	this.clients[id] = client;
	this.subscriptions[id] = function(senderId, message) {
		console.log('id ' + id + 'join  senderId ' + senderId + ' message '
				+ message);
		if (id !== senderId) {
			this.clients[id].write(message);
		}
	};
	this.on('broadcast', this.subscriptions[id]);
});

channel.on('leave', function(id) {
	this.removeListener('broadcast', this.subscriptions[id]);
	this.emit('broadcast', id, id + ' left the chat');
});

channel.on('shutdown', function() {
	this.emit('broadcast', '', 'Chat has shutdown \n');
	this.removeAllListeners('broadcast');
});

var server = net.createServer(function(client) {
	/*
	 * Its a catch here the connect event of socket given does 
	 * not work. Chatserver on start only connects
	 */
	var id = client.remoteAddress + ':' + client.remotePort;
	console.log(id);
	console.log("on connect id " + id);
	channel.emit('join', id, client);
	client.on('data', function(data) {
		console.log('data is ' + data.toString());
		if (data.toString() === 'shutdown\r\n') {
			channel.emit('shutdown');
			return;
		}
		channel.emit('broadcast', id, data.toString());
	});

	client.on('close', function() {
		channel.emit('leave', id);
	});
});

server.listen(8888, function(client) {
	console.log('started');
});
// small test
/*channel.on('hello', function() {
	console.log('Hello world');
});
channel.emit('hello');*/

