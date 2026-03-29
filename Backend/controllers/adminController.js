const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

exports.registerAdmin = async (req, res) => {
  const { name, lname, phoneNumber, email, password, createdAt } = req.body;

  if (!name || !lname || !phoneNumber || !email || !password || !createdAt) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ name, lname, phoneNumber, email, password: hashedPassword, createdAt });

    await newAdmin.save();
    const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ message: "Registration successful", token, admin: newAdmin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) return res.status(403).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, username: admin.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin fetched successfully", admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, lname, phoneNumber } = req.body;

  try {
    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.name = name || admin.name;
    admin.email = email || admin.email;
    if (password) admin.password = await bcrypt.hash(password, 10);
    admin.lname = lname || admin.lname;
    admin.phoneNumber = phoneNumber || admin.phoneNumber;

    await admin.save();
    res.status(200).json({ message: "Admin updated successfully", admin });
  } catch (error) {
    res.status(500).json({ message: "Error updating admin", error: error.message });
  }
};
