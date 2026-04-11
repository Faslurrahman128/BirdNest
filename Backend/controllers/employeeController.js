const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');

// Staff registration endpoint
router.post('/register', async (req, res) => {
  const { name, Lname, Phonenumber, email, password, role, createdAt } = req.body;
  try {
    // Check if the email is already registered
    const existingStaff = await Employee.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new staff
    const newStaff = new Employee({
      name,
      Lname,
      Phonenumber,
      email,
      password: hashedPassword,
      role,
      createdAt
    });
    await newStaff.save();
    res.json({ message: 'Staff registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Staff login endpoint

// Staff login endpoint with debug logging
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log("[STAFF LOGIN] Email received:", email);
    const staff = await Employee.findOne({ email });
    console.log("[STAFF LOGIN] Staff found:", staff);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    const isMatch = await bcrypt.compare(password, staff.password);
    console.log("[STAFF LOGIN] Password match:", isMatch);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log("[STAFF LOGIN] Staff role:", staff.role);
    console.log("[STAFF LOGIN] Staff isActive status:", staff.isActive);
    
    if (staff.role === "Admin") {
      return res.status(403).json({ error: 'Admin accounts must use the dedicated Admin Login portal.' });
    }
    
    // Explicitly check for false to ensure deactivated accounts stay blocked
    if (staff.isActive === false) {
      console.log("[STAFF LOGIN] REJECTED: Account is deactivated.");
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact an administrator.' });
    }
    // You can add JWT here if needed
    res.json({ message: 'Staff login successful', username: staff.name });
  } catch (err) {
    console.error("[STAFF LOGIN] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Fetch all staff members endpoint
router.get('/all', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle staff active status
router.put('/status/:id', async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  try {
    const checkStaff = await Employee.findById(id);
    if (checkStaff && checkStaff.role === 'Admin' && isActive === false) {
      return res.status(400).json({ error: 'Administrator accounts cannot be deactivated for security reasons.' });
    }
    const staff = await Employee.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    res.json({ message: `Staff ${isActive ? 'activated' : 'deactivated'} successfully`, staff });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk delete staff profiles
router.post('/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No staff IDs provided for deletion.' });
  }
  try {
    // Safety Check: Ensure no admins are in the list
    const admins = await Employee.find({ _id: { $in: ids }, role: 'Admin' });
    if (admins.length > 0) {
      return res.status(400).json({ error: 'Operation rejected: One or more selected accounts are Administrators and cannot be deleted.' });
    }

    const result = await Employee.deleteMany({ _id: { $in: ids } });
    res.json({ message: `Successfully deleted ${result.deletedCount} staff profiles.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a single staff profile
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const staff = await Employee.findById(id);
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    
    // Safety check: Cannot delete admins
    if (staff.role === 'Admin') {
      return res.status(400).json({ error: 'Administrator accounts cannot be deleted for security reasons.' });
    }

    await Employee.findByIdAndDelete(id);
    res.json({ message: 'Staff profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
