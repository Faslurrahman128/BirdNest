const Ticket = require("../models/Ticket");

// Create a new ticket
const raiseTicket = async (req, res) => {
  try {
    const { title, category, priority, description } = req.body;

    if (!title || !category || !priority || !description) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newTicket = new Ticket({
      title,
      category,
      priority,
      description,
    });

    await newTicket.save();
    res.status(201).json({ message: "Ticket raised successfully", ticket: newTicket });
  } catch (error) {
    console.error("Error in raiseTicket:", error); // <-- Log actual error
    res.status(500).json({ error: error.message || "Server error while raising ticket." });
  }
};


module.exports = { raiseTicket };