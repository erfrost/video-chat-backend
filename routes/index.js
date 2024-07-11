const express = require("express");
const router = express.Router({ mergeParams: true });

router.use("/auth", require("./auth.router"));

router.use("/user", require("./user.router"));

router.use("/images", require("./files.router"));

router.use("/admin", require("./admin.router"));

router.use("/broadcast", require("./broadcast.router"));

module.exports = router;
