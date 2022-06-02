/**
 * Socket Controller
 */

 const debug = require('debug')('battleship:socket_controller');
 let io = null; // socket.io server instance

 const players = [];

 /**
  * Handle a user joining a room
  *
  */
  const handleUserJoined =  function(username) {
    debug(`User ${username} with socket id ${this.id} wants to join room`);
    if(players.length === 0) {
        const p1 = {
            id: this.id,
            username: username,
            myTurn: true,
            room: 'game'
        }

        this.join(p1.room)
        players.push(p1);

        debug("players before emitting new list", players)

        io.to(p1.room).emit("game:profiles", players);
    }

   else if(players.length <= 1){
        const p2 = {
            id: this.id,
            username: username,
            myTurn: false,
            room: 'game'
        }
        
        this.join(p2.room)
        players.push(p2)

        debug("players before emitting new list", players)

        io.to(p2.room).emit("game:profiles", players);
    }

    else{
        this.emit('game:full')

        delete this.id
        return
    }
 }
 const handleDisconnect = function() {
    debug(`Client ${this.id} disconnected`);
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