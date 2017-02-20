/**
 * http://usejsdoc.org/
 */
var socket;
var Chat = function(socket) {
	this.socket = socket;
};

Chat.prototype.sendMessage = function(room, text) {
	console.log("Chat reached " + room + ' text ' + text);
	var message = {
		room : room,
		text : text
	}
	this.socket.emit('message', message);
};
