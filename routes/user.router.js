const express = require("express");
const router = express.Router({ mergeParams: true });
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth.middleware");
const User = require("../models/User");
const validator = require("validator");

router.get("/", auth, async (req, res) => {
  try {
    const { _id } = req.user;

    const currentUser = await User.findOne({ _id }).select(
      "-password -passport"
    );
    if (currentUser.gender === "male") {
      delete currentUser.passportIsVerified;
    }

    res.status(200).json(currentUser);
  } catch (error) {
    res
      .status(400)
      .json({ message: "На сервере произошла ошибка. Попробуйте позднее" });
  }
});

router.get("/catalog", auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);

    let girls = [];

    if (limit >= 0 && offset >= 0) {
      girls = await User.find({ passportIsVerified: true, gender: "female" })
        .skip(offset)
        .limit(limit)
        .select(
          "-email -phone -password -dateBirth -passport -gender -passportIsVerified"
        );
    } else {
      girls = await User.find({
        passportIsVerified: true,
        gender: "female",
      }).select(
        "-email -phone -password -dateBirth -passport -gender -passportIsVerified"
      );
    }

    res.status(200).json({ girls });
  } catch (error) {
    res
      .status(400)
      .json({ message: "На сервере произошла ошибка. Попробуйте позднее" });
  }
});

router.put("/update", auth, async (req, res) => {
  try {
    const { nickname, email, phone, password } = req.body;
    const { _id: userId } = req.user;

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Некорректный email",
      });
    }
    if (!validator.isMobilePhone(phone)) {
      return res.status(400).json({
        message: "Некорректный номер телефона",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        message: "Длина пароля должна быть не менее 8 символов",
      });
    }
    if (/[а-яА-Я]/.test(password)) {
      return res.status(400).json({
        message:
          "Пароль может содержать только латинские символы, цифры и специальные символы",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { nickname, email, phone, password: hashedPassword },
      { new: true }
    ).select("-password -passport");
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "На сервере произошла ошибка. Попробуйте позднее" });
  }
});

module.exports = router;
