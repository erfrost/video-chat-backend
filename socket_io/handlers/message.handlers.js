const Message = require("../../models/Message.js");
const User = require("../../models/User.js");

const messages = {};

module.exports = function messageHandlers(io, socket) {
  const { roomId } = socket;

  const updateMessageList = (newMessage) => {
    io.to(roomId).emit("message_list:update", newMessage);
  };

  socket.on("message:get", async () => {
    const _messages = await Message.find({ roomId });

    messages[roomId] = _messages;

    updateMessageList();
  });

  socket.on("message:add", async (message) => {
    if (!messages[roomId]) {
      messages[roomId] = [];
    }

    const { nickname } = await User.findById(message.senderId).select(
      "nickname"
    );

    const newMessage = await Message.create({
      ...message,
      senderNickname: nickname,
    });

    messages[roomId].push(message);

    updateMessageList(newMessage);
  });
};
