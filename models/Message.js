const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    roomId: {
      type: String,
      require: true,
    },
    senderId: {
      type: String,
      require: true,
    },
    senderNickname: {
      type: String,
      require: true,
    },
    text: {
      type: String,
      require: true,
    },
    media: {
      type: [
        {
          type: String,
        },
      ],
      require: true,
    },
    isDelivered: {
      type: Boolean,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Message", schema);
