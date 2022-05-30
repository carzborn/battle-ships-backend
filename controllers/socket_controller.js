/**
 * Socket Controller
 */

 const debug = require('debug')('battleship:socket_controller');
 let io = null; // socket.io server instance
 
 
 // list of rooms and their connected users
 const rooms = [
     {
         id: 'game',
         name: 'Game',
         users: {},
     }
 ];
 
 /**
  * Get room by ID
  *
  * @param {String} id ID of Room to get
  * @returns
  */
  const getRoomById = id => {
     return rooms.find(room => room.id === id)
 }
 
 const getRoomByUserId = id => {
     return rooms.find(gameroom => gameroom.users.hasOwnProperty(id));
 }
 
 /**
  * Handle a user joining a room
  *
  */
  const handleUserJoined = async function(username, room_id, callback) {
     debug(`User ${username} with socket id ${this.id} wants to join room '${room_id}'`);
 
     // join room
     this.join(room_id);
 
     // add socket to list of online users in this room
     // a) find room object with `id` === `game`
     const room = getRoomById(room_id);
 
     // b) add socket to room's `users` object
     room.users[this.id] = username;
 
     // let everyone know that someone has joined the room
     this.broadcast.to(room.id).emit('user:joined', username);
 
     // confirm join
     callback({
         success: true,
         roomName: room.name,
         users: room.users
     });
 
     // broadcast list of users to everyone in the room
     io.to(room.id).emit('user:list', room.users);
 }
 const handleDisconnect = function() {
     debug(`Client ${this.id} disconnected :(`);
 
     // find the room that this socket is part of
     const room = getRoomByUserId(this.id);
 
     // if socket was not in a room, don't broadcast disconnect
     if (!room) {
         return;
     }
 
     // let everyone in the room know that this user has disconnected
     this.broadcast.to(room.id).emit('user:disconnected', room.users[this.id]);
 
     // remove user from list of users in that room
     delete room.users[this.id];
 
     // broadcast list of users in room to all connected sockets EXCEPT ourselves
     this.broadcast.to(room.id).emit('user:list', room.users);
 }
 
 const handleUserLeft = async function(username, room_id) {
     debug(`User ${username} with socket id ${this.id} left room '${room_id}'`);
 
     // leave room
     this.leave(room_id);
 
     // remove socket from list of online users in this room
     // a) find room object with `id` === `game`
     const room = getRoomById(room_id);
 
     // b) remove socket from room's `users` object
     delete room.users[this.id];
 
     // let everyone know that someone left the room
     this.broadcast.to(room.id).emit('user:left', username);
 
     // broadcast list of users to everyone in the room
     io.to(room.id).emit('user:list', room.users);
 }
 
 /**
  * Handle a user requesting a list of rooms
  *
  */
 const handleGetRoomList = function(callback) {
     // generate a list of rooms with only their id and name
     const room_list = rooms.map(room => {
         return {
             id: room.id,
             name: room.name,
         }
     });
 
     // send list of rooms back to the client
     callback(room_list);
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
 
    // handle user left
     socket.on('user:left', handleUserLeft);

 
    // handle get room list request
     socket.on('get-room-list', handleGetRoomList);
 
    // handle user joined
     socket.on('user:joined', handleUserJoined);
 }