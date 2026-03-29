const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  

  if (!authHeader) {
    return res.status(403).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract token
  
  if (!token) {
    return res.status(403).json({ error: "Token is missing" });
  }

  try {
    // Verify token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ensure only admins can proceed
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    // Attach user info to request object
    req.userId = decoded.id;
    req.userRole = decoded.role;

    next(); // Move to the next middleware
  } catch (err) {
    console.error("JWT Verification Error:", err);

    // Handle specific JWT errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please log in again." });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token. Authentication failed." });
    }

    res.status(401).json({ error: "Authentication error" });
  }
};

module.exports = adminAuth;
