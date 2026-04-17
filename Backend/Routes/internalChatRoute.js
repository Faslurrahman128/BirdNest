const express = require("express");
const auth = require("../middlewares/auth");
const {
  getContacts,
  getConversation,
  sendMessage,
  markConversationRead,
  editMessage,
  deleteMessageForMe,
  deleteMessageForEveryone,
} = require("../controllers/internalChatController");

const router = express.Router();

router.get("/contacts", auth, getContacts);
router.get("/conversation/:otherId", auth, getConversation);
router.put("/conversation/:otherId/read", auth, markConversationRead);
router.post("/send", auth, sendMessage);
router.put("/messages/:messageId/edit", auth, editMessage);
router.put("/messages/:messageId/delete-for-me", auth, deleteMessageForMe);
router.put("/messages/:messageId/delete-for-everyone", auth, deleteMessageForEveryone);

module.exports = router;
