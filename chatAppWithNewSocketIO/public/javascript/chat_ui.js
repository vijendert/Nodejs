/**
 * http://usejsdoc.org/
 */
// here we need to format the text
function divEscapedContentElement(message) {
	return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
	return $('<div></div>').html('<i>' + message + '<i>');
}

var socket = io.connect();

$(document).ready(function() {
	var chat = new Chat(socket);
	socket.on('nameAssigned', function(result) {

		var message;
		if (result.success) {
			message = "You are loggeg in  as :" + result.name + '.';
		} else {
			message = result.message;
		}
		$('#messages').append(divSystemContentElement(message));
	});

	socket.on('joinedRoom', function(room) {
		$('#room').text(room.room);
		$('#messages').append(divEscapedContentElement('Room changed'));
	});

	socket.on('message', function(message) {
		$('#messages').append(divEscapedContentElement(message.text));
	});

	// grab the message
	$('#send-form').submit(function() {
		console.log("SUbmit button pressed");
		var message = $('#send-message').val();
		console.log("Message is " + message);
		chat.sendMessage($('#room').text(), message);
		$('#messages').append(divEscapedContentElement(message));
		$('#send-message').val('');
		return false;
	})
});