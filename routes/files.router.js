const express = require("express");
const router = express.Router({ mergeParams: true });
const multerConfig = require("../multer.config");
const upload = require("multer")(multerConfig);
require("dotenv").config();

router.post("/singleUpload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    const path = process.env.BASEIMAGESURL + file.filename;

    res.status(200).json({ avatar_path: path });
  } catch {
    res
      .status(500)
      .json({ message: "На сервере произошла ошибка. Попробуйте позже" });
  }
});

router.post("/multipleUpload", upload.array("images"), async (req, res) => {
  try {
    const files = req.files;

    const paths = files.map(
      (file) => process.env.BASEIMAGESURL + file.filename
    );

    res.status(200).json({ passport_paths: paths });
  } catch {
    res
      .status(500)
      .json({ message: "На сервере произошла ошибка. Попробуйте позже" });
  }
});

module.exports = router;
