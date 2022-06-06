/**
 * Socket Controller
 */

const { emit } = require('nodemon');

 const debug = require('debug')('battleship:socket_controller');
 let io = null; // socket.io server instance

//  const players = [];


 const room = {
     id: 'game',
     name: 'Game', 
     players: [],
 }
 /**
  * Handle a user joining a room
  *
  */
  const handleUserJoined =  function(username) {
    debug(`User ${username} with socket id ${this.id} wants to join room`);
    
    if(room.players.length < 2) {

        const player  = {
            id: this.id,
            username: username,
        }

        this.join(room)
        room.players.push(player);

        debug("rad 35", room)

        io.to(room).emit("game:profiles", room.players);
    }

    else {
        this.emit('game:full')

        delete this.id
        return
    }
 }


 const handleDisconnect = function() {

    debug(`Client ${this.id} disconnected`);
    
    this.broadcast.to(room).emit('player:disconnected')
    room.players = []

 }
 

 const handleClickOnBoard = function (data) {
	debug(`User ${this.id} pressed ${data}`)

	this.broadcast.emit('user:click', data)
 }

const handleReply = function (data, boolean) {
    debug(`reply at ${data} and its ${boolean}`);
    this.broadcast.emit('user:recieved', data, boolean)
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
 
	 socket.on('user:clicked', handleClickOnBoard);

     socket.on('user:reply', handleReply);
 
    // handle user joined
     socket.on('user:joined', handleUserJoined);
 }