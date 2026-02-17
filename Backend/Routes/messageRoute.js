const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

// Route to create a new message
router.post("/send", messageController.createMessage);

// Route to get messages for a specific room
router.get("/messages/:roomID", messageController.getMessages);

module.exports = router;
