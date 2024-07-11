const express = require("express");
const User = require("../models/User");
const Broadcast = require("../models/Broadcast");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/auth.middleware");
const BroadCast = require("../models/Broadcast");
require("dotenv").config();

router.post("/start", auth, async (req, res) => {
  try {
    const { _id: userId } = req.user;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(400).json({
        message: "Пользователь не найден",
      });
    }
    if (currentUser.gender !== "female") {
      return res.status(400).json({
        message: "Трансляции могут запускать только девушки",
      });
    }
    if (!currentUser.passportIsVerified) {
      return res.status(400).json({
        message: "Паспорт неверифицирован",
      });
    }

    const existingBroadcast = await Broadcast.findOne({ userId });
    if (existingBroadcast) {
      return res.status(400).json({
        message: "Вы можете вести не более одной трансляции одновременно",
      });
    }

    const newBroadcast = await Broadcast.create({ userId });

    await User.updateOne({
      isOnline: true,
    });

    res.status(200).json({ broadcast_id: newBroadcast._id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "На сервере произошла ошибка. Попробуйте позже" });
  }
});

router.post("/end", auth, async (req, res) => {
  try {
    const { _id: userId } = req.user;

    const currentBroadcast = await Broadcast.findOne({
      userId,
    });
    if (!currentBroadcast) {
      return res.status(400).json({
        message: "Трансляция не найдена",
      });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(400).json({
        message: "Пользователь не найден",
      });
    }

    await currentBroadcast.deleteOne();

    await currentUser.updateOne({ isOnline: false });

    res.status(200).json({ status: "Успешно" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "На сервере произошла ошибка. Попробуйте позже" });
  }
});

router.get("/online", auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);

    let broadcasts = [];

    if (limit && offset) {
      broadcasts = await BroadCast.find().skip(offset).limit(limit);
    } else {
      broadcasts = await BroadCast.find();
    }

    const resultPromises = broadcasts.map(async (broadcast) => {
      const currentUser = await User.findById(broadcast.userId);
      if (!currentUser) {
        throw new Error("Пользователь не найден");
      }

      return {
        ...broadcast.toObject(),
        nickname: currentUser.nickname,
        avatar: currentUser.avatar,
      };
    });

    const result = await Promise.all(resultPromises);

    res.status(200).json({ broadcasts: result });
  } catch (error) {
    res.status(500).json({
      message: "На сервере произошла ошибка. Попробуйте позже",
    });
  }
});

module.exports = router;
