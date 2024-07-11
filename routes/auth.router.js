const express = require("express");
const router = express.Router({ mergeParams: true });
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {
  generate,
  save,
  validateRefresh,
  findToken,
} = require("../services/tokenService");
const validator = require("validator");
const validAge = require("../utils/validAge");

router.post("/signUp", async (req, res) => {
  try {
    const {
      email,
      phone,
      nickname,
      password,
      gender,
      avatar,
      passport,
      dateBirth,
    } = req.body;

    if (
      !email ||
      !phone ||
      !nickname ||
      !password ||
      !gender ||
      !dateBirth ||
      (gender == "female" && !passport)
    ) {
      return res.status(400).json({
        message: "Проверьте правильность введенных данных",
      });
    }

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
    if (!validAge(dateBirth)) {
      return res.status(400).json({
        message: "Доступ к платформе только с 18 лет",
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        message: "Данный пользователь уже зарегистрирован",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      email,
      phone,
      password: hashedPassword,
      nickname,
      gender,
      avatar,
      passport,
      passportIsVerified: false,
      dateBirth,
      isOnline: false,
    });

    const tokens = generate({ _id: newUser._id });

    await save(newUser._id, tokens.refreshToken);

    res.status(201).send({ ...tokens, userId: newUser._id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "На сервере произошла ошибка. Попробуйте позже" });
  }
});

router.post("/signIn", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const existingUser = await User.findOne({ phone });
    if (!existingUser) {
      return res.status(201).send({
        message: "Неверное имя пользователя или пароль",
      });
    }

    const isPasswordEqual = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordEqual) {
      return res.status(201).send({
        message: "Неверное имя пользователя или пароль",
      });
    }

    const tokens = generate({ _id: existingUser._id });
    await save(existingUser._id, tokens.refreshToken);

    res.status(200).send({ ...tokens, userId: existingUser._id });
  } catch {
    res
      .status(500)
      .json({ message: "На сервере произошла ошибка. Попробуйте позже" });
  }
});

function isTokenInvalid(data, dbToken) {
  return !data || !dbToken || data._id !== dbToken?.user?.toString();
}

router.post("/token", async (req, res) => {
  try {
    const { refresh_token: refreshToken } = req.body;
    const data = validateRefresh(refreshToken);
    const dbToken = await findToken(refreshToken);

    if (isTokenInvalid(data, dbToken)) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const tokens = generate({ _id: data._id });
    await save(data._id, tokens.refreshToken);

    res.status(200).send({ ...tokens, userId: data._id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "На сервере произошла ошибка. Попробуйте позже" });
  }
});

module.exports = router;
