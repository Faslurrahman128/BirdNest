const express = require("express");
const auth = require("../middlewares/auth");
const { chatWithAssistant } = require("../controllers/aiController");

const router = express.Router();

// Optional auth: use token when available, but do not block guest users.
router.post("/chat", (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return next();
  return auth(req, res, next);
}, chatWithAssistant);

module.exports = router;
