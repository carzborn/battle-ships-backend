/**
 * Socket Controller
 */

const debug = require('debug')('clock:socket_controller');
let io = null; // socket.io server instance

/**
 * Handle a user disconnecting
 *
 */
const handleDisconnect = function() {
	debug(`Client ${this.id} disconnected :(`);
}

/**
 * Handle clock start
 *
 */
const handleJoinGame = function() {
	debug(`Client ${this.id} wants to join the game`);

	// tell everyone connected to start their clocks
	io.emit('join:game')
}


/**
 * Export controller and attach handlers to events
 *
 */
module.exports = function(socket, _io) {
	// save a reference to the socket.io server instance
	io = _io;

	debug(`Client ${socket.id} connected`)

	// handle user disconnect
	socket.on('disconnect', handleDisconnect);

	// listen for 'clock:start' event
	socket.on('clock:start', handleJoinGame)
}
