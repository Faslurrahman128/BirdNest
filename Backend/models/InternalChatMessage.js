const mongoose = require("mongoose");

const internalChatMessageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderRole: { type: String, required: true },
    senderName: { type: String, required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
    receiverRole: { type: String, required: true },
    receiverName: { type: String, required: true },
    text: { type: String, required: true, trim: true, maxlength: 1500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InternalChatMessage", internalChatMessageSchema);
