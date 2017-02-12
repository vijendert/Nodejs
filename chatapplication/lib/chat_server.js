var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

// This method takes the socket on which the user connects
// Creates a user name Guest + number
// this value is stored in nameUsed and nickNames
function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
	var name = "Guest" + guestNumber;
	nickNames[socket.id] = name;
	// Here we are letting cleint know their name we are emitting a message
	socket.emit('nameResult', {
		success : true,
		name : name
	});
	namesUsed.push(name);
	return guestNumber + 1;
}
function joinRoom(socket, room) {
	// Lets create a channel
	// In other words link socket to room
	socket.join(room);
	currentRoom[socket.id] = room;
	// Need to tell every one in the room that this guy have joined
	socket.emit('joinResult', {
		room : room
	});
	// Tell all user in aroom that u joined
	socket.broadcast.to(room).emit('message', {
		text : nickNames[socket.id] + 'has joined ' + room + '.'
	});
	var usersInRoom = io.sockets.clients(room);
	// var usersInRoom = io.sockets.server.eio.clientsCount;
	// working with latest var usersInRoom = io.sockets.adapter.rooms[room];
	if (usersInRoom > 0) {
		var usersInRoomSummary = 'Users currently in ' + room + ': ';
		for ( var index in usersInRoom) {
			var userSocketId = usersInRoom[index].id;
			if (userSocketId !== socket.id) {
				if (index > 0) {
					usersInRoomSummary += ', ';
				}
				usersInRoomSummary += nickNames[userSocketId];
			}
		}
		usersInRoomSummary += '.';
		socket.emit('message', {
			text : usersInRoomSummary
		});
	}

}

function handleNameChangeAttempts(socket, nickNames, namesUsed) {
	socket.on('nameAttempt', function(name) {
		if (name.indexOf('Guest') === 0) {
			socket.emit('nameResult', {
				success : false,
				message : 'Name cannot begin with Guest'
			});
		} else {
			if (namesUsed.indexOf(name) === -1) {
				var previousName = nickNames[socket.id];
				var previousNameIndex = namesUsed.indexOf(previousName);
				namesUsed.push(name);
				nickNames[socket.id] = name;
				delete namesUsed[previousNameIndex];
				socket.emit('nameResult', {
					success : true,
					name : name
				});
				socket.broadcast.to(currentRoom[socket.id]).emit('message', {
					text : previousName + 'is now known aas ' + name + '.'
				});
			} else {
				socket.emit('nameResult', {
					success : false,
					message : 'That name is already in use'
				});
			}
		}
	});
}

function handleMessageBroadCasting(socket, nickNames) {
	socket.on('message', function(message) {
		socket.broadcast.to(message.room).emit('message', {
			text : nickNames[socket.id] + ":" + message.text
		});
	});
}

function handleRoomJoining(socket) {
	socket.on('join', function(room) {
		socket.leave(currentRoom[socket.id]);
		joinRoom(socket, room.newRoom);
	});
}

function handleClientDisconnection(socket, nickNames, namesUsed) {
	socket.on('disconnect', function() {
		var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
		delete namesUsed[nameIndex];
		delete nickNames[socket.id];
	});
}

// exports is a way you can create a function at module evel which can
// easily called or readily available using require
exports.listen = function(server) {
	io = socketio.listen(server);
	io.set('log level', 1);
	// consider it if any client connect to this socket or http connection
	// socket passed inside the function is net.socket
	io.on('connection',
			function(socket) {
				// assign user a guest name
				guestNumber = assignGuestName(socket, guestNumber, nickNames,
						namesUsed);

				joinRoom(socket, 'Lobby');
				handleMessageBroadCasting(socket, nickNames);
				handleNameChangeAttempts(socket, nickNames, namesUsed);
				handleRoomJoining(socket);
				socket.on('rooms', function() {
					// new io.sockets.adapter.rooms
					// io.sockets.manager.rooms
					socket.emit('rooms', io.sockets.manager.rooms);
				});
				handleClientDisconnection(socket, nickNames, namesUsed);
			});
};
