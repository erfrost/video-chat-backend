const userHandlers = require("./handlers/user.handlers.js");
const messageHandlers = require("./handlers/message.handlers.js");

module.exports = function onConnection(io, socket) {
  const { roomId, userName } = socket.handshake.query;

  socket.roomId = roomId;
  socket.userName = userName;

  socket.join(roomId);

  userHandlers(io, socket);

  messageHandlers(io, socket);
};
