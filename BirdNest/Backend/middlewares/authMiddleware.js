const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

exports.verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  

  if (!authHeader) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  const token = authHeader.split(" ")[1]; // Extract token
  

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};


exports.verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied: Admins Only!" });
  }
  next();
};

exports.verifyCustomer = (req, res, next) => {
  if (!req.user || req.user.role !== "customer") {
    return res.status(403).json({ message: "Access Denied: Customers Only!" });
  }
  next();
};

exports.verifyCustomerOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== "customer" && req.user.role !== "admin")) {
    return res.status(403).json({ message: "Access Denied: Customers or Admins Only!" });
  }
  next();
};

exports.authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Assuming token is sent as Bearer token in the header

  if (!token) {
    return res.status(401).json({ status: "Error", message: 'Authorization token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Assuming 'id' is the user's ID in the JWT payload
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

