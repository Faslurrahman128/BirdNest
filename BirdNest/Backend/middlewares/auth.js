const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract the token after 'Bearer'
  if (!token) {
    return res.status(403).json({ error: "Token is missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Attach user ID to request object
    req.userRole = decoded.role; // Attach user role
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = auth;
