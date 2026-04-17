const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendCredentialEmail } = require('../utils/mailers');

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
    
    // Send Credentials via Email
    const emailSent = await sendCredentialEmail(newStaff, password);
    
    res.json({ 
      message: 'Staff registered successfully', 
      emailSent,
      id: newStaff._id, // Return ID for immediate follow-up actions
      info: emailSent ? 'Credentials sent to email.' : 'Registration successful but email failed to send. Check server configuration.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to manually resend credentials
router.post('/send-credentials', async (req, res) => {
  const { staffId, password } = req.body; // In a production system, we might prompt for a new temp password or use a reset link
  try {
    if (!staffId || !password) {
      return res.status(400).json({ error: 'Staff ID and temporary password are required.' });
    }
    const staff = await Employee.findById(staffId);
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }

    const emailSent = await sendCredentialEmail(staff, password);
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send credential email.' });
    }

    res.json({ message: 'Credentials successfully resent to staff email.' });
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
    // Generate JWT token for staff
    if (!process.env.JWT_SECRET) {
      console.error("[STAFF LOGIN] Error: JWT_SECRET not found in environment.");
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      { id: staff._id, role: staff.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "10h" } // Longer expiry for dashboard usage
    );

    res.json({ 
      message: 'Staff login successful', 
      token,
      userId: staff._id,
      username: staff.name,
      role: staff.role
    });
  } catch (err) {
    console.error("[STAFF LOGIN] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Fetch all staff members endpoint (Merged with Admin collection)
router.get('/all', async (req, res) => {
  try {
    const employees = await Employee.find();
    const admins = await Admin.find();
    
    // Map Admins to match Employee structure for the frontend
    const mappedAdmins = admins.map(admin => {
      const obj = admin.toObject();
      return {
        ...obj,
        role: obj.role || 'Admin', // Ensure role is present
        isActive: obj.isActive !== false // Respect the stored isActive state
      };
    });

    // Combine and send
    const combined = [...employees, ...mappedAdmins];
    res.json(combined);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change Password endpoint for currently logged in user
router.put('/change-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  try {
    const staff = await Employee.findOne({ email });
    if (!staff) return res.status(404).json({ error: 'Staff not found.' });

    const isMatch = await bcrypt.compare(oldPassword, staff.password);
    if (!isMatch) return res.status(401).json({ error: 'Current password not match.' });

    if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters long.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    staff.password = hashedPassword;
    await staff.save();

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle staff active status
router.put('/status/:id', async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  try {
    // Check Employee collection first
    let staff = await Employee.findById(id);
    let isAdminCollection = false;
    
    // If not in Employee, check Admin collection
    if (!staff) {
      staff = await Admin.findById(id);
      isAdminCollection = true;
    }

    if (!staff) return res.status(404).json({ error: 'Account not found' });

    // Global Safety Lock for Master Admin
    if (staff.email === 'faslurrahman128@gmail.com' && isActive === false) {
      return res.status(400).json({ error: 'The Master Administrator account cannot be deactivated for security reasons.' });
    }

    if (isAdminCollection) {
      const updatedAdmin = await Admin.findByIdAndUpdate(id, { isActive }, { new: true });
      return res.json({ message: `Admin ${isActive ? 'activated' : 'deactivated'} successfully`, staff: updatedAdmin });
    }

    const updatedStaff = await Employee.findByIdAndUpdate(id, { isActive }, { new: true });
    res.json({ message: `Staff ${isActive ? 'activated' : 'deactivated'} successfully`, staff: updatedStaff });
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
    // Safety Check: Ensure the master admin is not in the list
    const masterAdmins_Emp = await Employee.find({ _id: { $in: ids }, email: 'faslurrahman128@gmail.com' });
    const masterAdmins_Adm = await Admin.find({ _id: { $in: ids }, email: 'faslurrahman128@gmail.com' });
    
    if (masterAdmins_Emp.length > 0 || masterAdmins_Adm.length > 0) {
      return res.status(400).json({ error: 'Operation rejected: The Master Administrator account cannot be deleted.' });
    }

    const resultEmp = await Employee.deleteMany({ _id: { $in: ids } });
    const resultAdm = await Admin.deleteMany({ _id: { $in: ids } });
    
    res.json({ message: `Successfully deleted ${resultEmp.deletedCount + resultAdm.deletedCount} staff profiles.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a single staff profile
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let staff = await Employee.findById(id);
    let isAdminCollection = false;

    if (!staff) {
      staff = await Admin.findById(id);
      isAdminCollection = true;
    }

    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    
    // Safety check: Cannot delete master admin
    if (staff.email === 'faslurrahman128@gmail.com') {
      return res.status(400).json({ error: 'The Master Administrator account cannot be deleted for security reasons.' });
    }

    if (isAdminCollection) {
      await Admin.findByIdAndDelete(id);
    } else {
      await Employee.findByIdAndDelete(id);
    }
    
    res.json({ message: 'Staff profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
