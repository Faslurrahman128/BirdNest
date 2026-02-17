const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const Feedback = require("../models/Feedback");

const CustomerCareController = {
  async login(req, res) {
    const { email, password } = req.body;
    try {
      const user = await Customer.findOne({ email, role: "customerCare" });
      if (!user) {
        return res.status(401).json({ error: "Invalid email or role" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid password" });
      }
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ token, username: user.name });
    } catch (err) {
      console.error("Error in login:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  async register(req, res) {
    const { name, email, password, Lname, Phonenumber, createdAt, role } = req.body;
    try {
      const existingUser = await Customer.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new Customer({
        name,
        email,
        password: hashedPassword,
        Lname,
        Phonenumber,
        createdAt: createdAt || new Date(),
        role: role || "customerCare",
      });
      await newUser.save();
      res.status(201).json({ message: "Customer Care Manager registered successfully" });
    } catch (err) {
      console.error("Error in register:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  async getFeedbacks(req, res) {
    try {
      const feedbacks = await Feedback.find();
      res.json(feedbacks);
    } catch (err) {
      console.error("Error in getFeedbacks:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  async respondFeedback(req, res) {
    const { id } = req.params;
    const { response } = req.body;
    try {
      const feedback = await Feedback.findById(id);
      if (!feedback) {
        return res.status(404).json({ error: "Feedback not found" });
      }
      feedback.response = response;
      feedback.updatedAt = new Date();
      await feedback.save();
      res.json({ message: "Response saved successfully" });
    } catch (err) {
      console.error("Error in respondFeedback:", err);
      res.status(500).json({ error: "Server error" });
    }
  },
};

module.exports = CustomerCareController;