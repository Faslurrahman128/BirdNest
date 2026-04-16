const express = require("express");
const auth = require("../middlewares/auth");
const {
  getContacts,
  getConversation,
  sendMessage,
} = require("../controllers/internalChatController");

const router = express.Router();

router.get("/contacts", auth, getContacts);
router.get("/conversation/:otherId", auth, getConversation);
router.post("/send", auth, sendMessage);

module.exports = router;
