const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  roomID: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true }, // Room being referenced
  customerID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Tenant (sender)
  history: [
    {
      senderID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The sender (tenant)
      receiverID: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true }, // The receiver (landlord/room owner)
      message: { type: String, required: true }, // Message content
      timestamp: { type: Date, default: Date.now }, // When the message was sent
    },
  ],
});

module.exports = mongoose.model("Message", messageSchema);
