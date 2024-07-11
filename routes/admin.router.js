const express = require("express");
const router = express.Router({ mergeParams: true });
const adminAuth = require("../middleware/admin.middleware");
const User = require("../models/User");
require("dotenv").config();

router.post("/auth", async (req, res) => {
  try {
    const { login, password } = req.body;

    if (
      login === process.env.ADMINLOGIN &&
      password === process.env.ADMINPASSWORD
    ) {
      res
        .status(200)
        .json({ admin_access_token: process.env.ADMINACCESSTOKEN });
    } else {
      return res.status(400).json({
        message: "Неверный логин или пароль",
      });
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "На сервере произошла ошибка. Попробуйте позднее" });
  }
});

router.get("/notVerifiedGirls", adminAuth, async (req, res) => {
  try {
    const notVerifiedGirls = await User.find({
      passportIsVerified: false,
    }).select("-email -phone -password -dateBirth");

    res.status(200).json({
      not_verified_girls: notVerifiedGirls,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "На сервере произошла ошибка. Попробуйте позднее" });
  }
});

router.post("/verificationGirl/:user_id", adminAuth, async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) {
      return res.status(400).json({
        message: "Не указан _id девушки",
      });
    }

    const currentGirl = await User.findByIdAndUpdate(
      user_id,
      { passportIsVerified: true },
      { new: true }
    ).select("-email -phone -password -dateBirth");

    res.status(200).json({
      girl: currentGirl,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "На сервере произошла ошибка. Попробуйте позднее" });
  }
});

module.exports = router;
