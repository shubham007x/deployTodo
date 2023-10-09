var jwt = require("jsonwebtoken");
require("dotenv").config();
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    if (err) {
      res.send({ message: "not logged in" });
    } else {
      req.userId = decoded.userId;
      console.log(decoded.userId);
      next();
    }
  });
};
module.exports = { authenticate };
