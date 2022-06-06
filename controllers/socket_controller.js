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

 const handleClicks = function(data) {
    debug(`User  ${this.id} fired at ${data}`)

 }
 

const handleShot = function (clicked, hit) {
    debug(`reply at ${clicked} and its ${hit}`);
    this.broadcast.to(room).emit('shot:result', clicked, hit)
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
 
	 socket.on('user:shot', handleShot);

    socket.on('user:clicked', handleClicks)
    // handle user joined
     socket.on('user:joined', handleUserJoined);
 }