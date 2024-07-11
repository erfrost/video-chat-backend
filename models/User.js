const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    nickname: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      require: true,
    },
    avatar: {
      type: String,
    },
    passport: [
      {
        type: String,
      },
    ],
    passportIsVerified: {
      type: Boolean,
    },
    dateBirth: {
      type: String,
    },
    isOnline: {
      type: Boolean,
      require: true,
    },
  },
  { timestamps: true }
);

module.exports = model("User", schema);
