/**
 * http://usejsdoc.org/
 */
var socketio = require('socket.io');
var io;
var nickNames = {};
var namesUsed = [];
var currentRooms = {};
var guestNumber = 1;
exports.listen = function(server) {
	io = socketio.listen(server);// piggy backing on http server
	// now io is our main server which will act as a socket
	io.sockets.on('connection', function(socket) {
		guestNumber = assignName(socket, guestNumber, nickNames, namesUsed);
		joinRoom(socket, 'Lobby');
		handleMessageBroadCast(socket);
	});
};

function assignName(socket, guestNumber, nickNames, namesUsed) {
	var assignedName = "Guest" + guestNumber;
	console.log("socket.id = " + socket.id);
	nickNames[socket.id] = assignedName;
	socket.emit('nameAssigned', {
		name : assignedName,
		success : true
	});
	namesUsed.push(assignedName);
	console.log('client connected' + io.engine.clientsCount);
	// socket.join('Lobby');

	// var room = io.sockets.adapter.rooms['Lobby'];
	// console.log('room.length==' + room.length);

	return guestNumber + 1;
}

function joinRoom(socket, room) {
	socket.join(room);
	currentRooms[socket.id] = room;
	// current clinets joined to the rooom
	var usersInRoom = io.sockets.adapter.rooms[room];
	// tell everyone in the namespace you joined
	socket.emit('joinedRoom', {
		room : room
	});
	socket.to(room).emit(
			'message',
			{
				text : nickNames[socket.id] + ' has joined the room '
						+ currentRooms[socket.id]
			});
	if (usersInRoom.length > 1) {

		var usersInRoomSummary = 'Users currently in room ' + room + ':';
		var userSockets = usersInRoom.sockets;
		for ( var index in userSockets) {
			console.log("index is " + index + " userSockets " + userSockets);
			var socketId = index;
			console.log("socketId in joinRoom " + socketId);
			if (socketId !== socket.id) {
				if (usersInRoom.length > 1) {
					usersInRoomSummary += ', ';
				}

				usersInRoomSummary += nickNames[socketId];
			}
		}
		usersInRoomSummary += '.';
		console.log('usersInRoomSummary' + usersInRoomSummary);
		socket.emit('message', {
			text : usersInRoomSummary
		});
	}
}

function handleMessageBroadCast(socket) {
	socket.on('message', function(message) {
		console.log('message text' + message.text)
		socket.to(message.room).emit('message', {
			text : nickNames[socket.id] + ': ' + message.text
		});

	});
}