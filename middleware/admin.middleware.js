require("dotenv").config();

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") return next();

  try {
    console.log(req.headers);
    const accessToken = req.headers.authorization.split(" ")[1];

    if (!accessToken || accessToken !== process.env.ADMINACCESSTOKEN) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
