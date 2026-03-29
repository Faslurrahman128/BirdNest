const Message = require("../models/Message");
const Room = require("../models/Room");

// Function to create a new message
async function createMessage(req, res) {
  try {
    const { roomID, messageText } = req.body;

    // Assuming the logged-in user's ID is available in req.user (set by your authentication middleware)
    const senderID = req.user._id;  // Get logged-in user's ID (customer/tenant)

    if (!senderID) {
      return res.status(400).json({ message: "User not logged in" });
    }

    // Fetch the room details to get the ownerID (receiver) from the Room document
    const room = await Room.findById(roomID);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const receiverID = room.ownerID;  // The owner of the room (receiver)

    // Create the message
    const message = new Message({
      roomID,
      customerID: senderID, // Set the sender to the logged-in user (tenant)
      history: [
        {
          senderID,   // sender is the logged-in user (tenant)
          receiverID, // receiver is the owner of the room (landlord)
          message: messageText,
        },
      ],
    });

    // Save the message to the database
    await message.save();
    return res.status(201).json({ message: "Message created successfully", data: message });
  } catch (error) {
    console.error("Error creating message:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

// Function to get messages for a room
async function getMessages(req, res) {
  try {
    const { roomID } = req.params;

    // Fetch the messages for the room
    const messages = await Message.find({ roomID }).populate("history.senderID", "name email"); // Optional population for sender details
    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

module.exports = {
  createMessage,
  getMessages,
};
