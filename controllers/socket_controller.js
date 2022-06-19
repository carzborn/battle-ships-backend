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
    
    let turn

    if(room.players.length === 0){
        turn = true
    } else{
        turn = false
    }
    
    
    if(room.players.length < 2) {

        const player  = {
            id: this.id,
            username: username,
            turn: turn
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

 const onUserClick = function(index,i) {
    debug(`User ${this.id} fired at ${index}, ${i}`)
    this.broadcast.to(room).emit('user:shot', index,i)
    }
 

const handleReply = function (index, i, hit) {
    debug(`${this.id} reply at ${index},${i} and its ${hit}`);
    this.broadcast.to(room).emit('shot:result', index, i, hit)
}

const handleShipSunk = function () {
    this.broadcast.to(room).emit('ship:sunken')
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
 
	socket.on('user:reply', handleReply);

    socket.on('ship:sunken', handleShipSunk)

    socket.on('user:clicked', onUserClick)
    // handle user joined
     socket.on('user:joined', handleUserJoined);
 }