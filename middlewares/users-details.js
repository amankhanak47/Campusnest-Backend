var jwt = require("jsonwebtoken");
const JWT_SECRET = "qwertyuiop";
function authenticateUser(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({ success: false, errors: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;

    next();
  } catch (err) {
    res.status(401).json({ success: false, errors: "Token is not valid" });
    // next(err)
  }
}

module.exports = authenticateUser;
