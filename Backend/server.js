const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config(); // Load environment variables from .env file
const fs = require("fs");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./config/cloudinary");


const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"],
  },
});
app.set("io", io);

// Serve static files (images) from the 'uploads' folder (MUST be before any routes)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 8070; // Fallback to 8070 if PORT is not defined

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parse JSON payloads

// MongoDB Connection URL (Ensure .env has MONGODB_URL and JWT_SECRET set)
const URL = process.env.MONGODB_URL;

if (!URL) {
  console.error("MONGODB_URL is not defined in the .env file");
  process.exit(1);
}

mongoose
  .connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connection successful!"))
  .catch((err) => {
    console.error("MongoDB Connection failed:", err.message);
    process.exit(1); // Exit the process if connection fails
  });

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB is connected and ready!");
});

// Models
const Room = require("./models/Room");
const User = require("./models/User"); 
const Admin = require("./models/Admin");
const Employee = require("./models/Employee");
const Ticket = require("./models/Ticket");
const serviceProvider = require("./models/serviceProvider");
const InternalChatMessage = require("./models/InternalChatMessage");

// Temporary in-memory OTP store for admin password reset
const adminResetOtpStore = new Map();

const hashOtp = (otp) =>
  crypto.createHash("sha256").update(String(otp)).digest("hex");

const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const normalizeRole = (role = "") => role.toString().toLowerCase();
const isAdminRole = (role = "") => normalizeRole(role) === "admin";
const isServiceAgentRole = (role = "") => normalizeRole(role) === "service_agent";

async function resolveIdentityById(id) {
  const admin = await Admin.findById(id).select("name isActive");
  if (admin) {
    return {
      id: String(admin._id),
      name: admin.name || "Admin",
      role: "admin",
      isActive: admin.isActive !== false,
    };
  }

  const employee = await Employee.findById(id).select("name role isActive");
  if (employee) {
    return {
      id: String(employee._id),
      name: employee.name || "Staff",
      role: employee.role || "Staff",
      isActive: employee.isActive !== false,
    };
  }

  return null;
}

io.use((socket, next) => {
  try {
    const token = socket.handshake?.auth?.token || socket.handshake?.query?.token;
    if (!token) return next(new Error("Authentication token missing"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = {
      id: String(decoded.id),
      role: decoded.role || "",
    };
    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.user?.id;
  if (!userId) return;

  socket.join(`user:${userId}`);

  socket.on("internal:typing", ({ toUserId, isTyping }) => {
    if (!toUserId) return;

    io.to(`user:${String(toUserId)}`).emit("internal:typing", {
      fromUserId: userId,
      isTyping: !!isTyping,
    });
  });

  socket.on("internal:send", async ({ toUserId, text }) => {
    try {
      if (!toUserId || !text || !String(text).trim()) return;

      const senderIdentity = await resolveIdentityById(userId);
      const receiverIdentity = await resolveIdentityById(toUserId);
      if (!senderIdentity || !receiverIdentity) return;
      if (!senderIdentity.isActive || !receiverIdentity.isActive) return;

      const senderIsAdmin = isAdminRole(senderIdentity.role);
      const senderIsAgent = isServiceAgentRole(senderIdentity.role);
      const receiverIsAdmin = isAdminRole(receiverIdentity.role);
      const receiverIsAgent = isServiceAgentRole(receiverIdentity.role);

      const validPair =
        (senderIsAdmin && receiverIsAgent) ||
        (senderIsAgent && receiverIsAdmin);

      if (!validPair) return;

      const message = await InternalChatMessage.create({
        senderId: senderIdentity.id,
        senderRole: senderIdentity.role,
        senderName: senderIdentity.name,
        receiverId: receiverIdentity.id,
        receiverRole: receiverIdentity.role,
        receiverName: receiverIdentity.name,
        text: String(text).trim(),
        readAt: null,
      });

      io.to(`user:${senderIdentity.id}`).emit("internal:new-message", message);
      io.to(`user:${receiverIdentity.id}`).emit("internal:new-message", message);
    } catch (error) {
      console.error("[SOCKET] internal:send error", error.message);
    }
  });

  socket.on("internal:read", async ({ withUserId }) => {
    try {
      if (!withUserId) return;
      const readAt = new Date();

      await InternalChatMessage.updateMany(
        {
          senderId: String(withUserId),
          receiverId: String(userId),
          readAt: null,
        },
        {
          $set: { readAt },
        }
      );

      const payload = {
        byUserId: String(userId),
        withUserId: String(withUserId),
        readAt,
      };

      io.to(`user:${String(withUserId)}`).emit("internal:read-update", payload);
      io.to(`user:${String(userId)}`).emit("internal:read-update", payload);
    } catch (error) {
      console.error("[SOCKET] internal:read error", error.message);
    }
  });
});

// Multer setup for Cloudinary image uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "BirdNest_Properties",
    allowed_formats: ["jpg", "png", "jpeg"],
    public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`,
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Serve static files (images) from the 'uploads' folder (for legacy images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Email sending function
app.post("/send-email", async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: "Email and name are required" });
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "unistaymanagement@gmail.com",
        pass: "fcez nici kcvj lenq", // Paste the generated App Password here
      },
    });

    // Email options
  const mailOptions = {
  from: process.env.EMAIL_USER,
  to: email,
  subject: "Welcome to UniStay - Your Trusted Boarding Partner!",
  html: `<h2>Hi ${name},</h2>
         <p>Welcome to <strong>UniStay</strong>! 🎉 We're excited to have you on board.</p>
         <p>UniStay is designed to make your boarding experience seamless and secure. Here’s what you can expect:</p>
         <ul>
           <li>🏠 <strong>Verified Listings:</strong> All rooms are reviewed and approved by our boarding manager to ensure quality and safety.</li>
           <li>💬 <strong>Built-in Messaging:</strong> Easily chat with landlords through our secure messaging system.</li>
           <li>🎟️ <strong>Ticket Support:</strong> Have any questions or issues? Our ticket system allows you to get assistance quickly.</li>
           <li>📢 <strong>List Your Boarding House:</strong> If you're a landlord, you can easily add your boarding house and connect with potential tenants.</li>
         </ul>
         <p>We’re here to help you find (or list) the perfect place to stay. Log in now and explore your options!</p>
         <p>Best Regards,<br><strong>The UniStay Team</strong></p>`,
};

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ error: "Error sending email" });
  }
});

// Admin Registration Route
app.post("/Adminregister", async (req, res) => {
  const { name, Lname, Phonenumber,  email, password, createdAt } = req.body;

  try {
    // Check if the email is already registered
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with role 'Admin'
    const newAdmin = new Admin({
      name,
      Lname,
      Phonenumber,
      email,
      password: hashedPassword,
      createdAt,
      role: "Admin"
    });
    await newAdmin.save();

    res.json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error("Error during registration:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(403).json({ error: "Invalid credentials" });

    // Ensure process.env.JWT_SECRET is set correctly
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "JWT Secret is not defined" });
    }

    // Check if the user has any booked rooms where they are the owner
    const bookedRoom = await Room.findOne({ customerId: user._id, isBooked: true });

    let alertMessage = null;
    if (bookedRoom) {
      alertMessage = `Reminder: The room in ${bookedRoom.roomCity}  you Listed is  booked! View buyer infor in listings`;
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ 
      token, 
      username: user.name, 
      userLname: user.Lname,
      alertMessage  // Send alert message if a room is booked
    });

  } catch (err) {
    console.error("Error during login:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Admin Login Route
app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Check Admin collection first
    let admin = await Admin.findOne({ email });
    let source = "Admin";
    
    // 2. If not found, check Employee collection (but only if they have the Admin role)
    if (!admin) {
      const Employee = require("./models/Employee"); // Import locally to avoid circular dependency
      admin = await Employee.findOne({ email, role: "Admin" });
      source = "Employee";
    }

    if (!admin) return res.status(404).json({ error: "Admin account not found" });

    // Check if account is deactivated
    if (admin.isActive === false) {
      return res.status(403).json({ error: "This administrator account has been deactivated." });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) return res.status(403).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: "admin", source: source }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );
    
    res.json({ 
      token, 
      userId: admin._id,
      username: admin.name,
      role: "Admin"
    });
  } catch (err) {
    console.error("Error during admin login:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Request OTP for admin password reset
app.post("/admin/forgot-password/request-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    let account = await Admin.findOne({ email });
    let source = "Admin";

    if (!account) {
      account = await Employee.findOne({ email, role: "Admin" });
      source = "Employee";
    }

    if (!account) {
      return res.status(404).json({ error: "No admin account found for this email." });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    adminResetOtpStore.set(email.toLowerCase(), {
      otpHash,
      expiresAt,
      source,
      attemptsLeft: 5,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Bird Nest Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Bird Nest Admin Password Reset OTP",
      html: `
        <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="margin-top:0;color:#1a237e;">Bird Nest Admin Security</h2>
          <p>Your one-time password (OTP) to reset admin password is:</p>
          <div style="font-size:28px;font-weight:700;letter-spacing:6px;color:#0f172a;background:#f8fafc;padding:14px 18px;border-radius:10px;display:inline-block;">
            ${otp}
          </div>
          <p style="margin-top:16px;">This OTP will expire in 10 minutes.</p>
          <p style="color:#64748b;font-size:13px;">If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });

    return res.json({ message: "OTP sent successfully. Please check your email." });
  } catch (err) {
    console.error("Error sending admin reset OTP:", err.message);
    return res.status(500).json({ error: "Failed to send OTP email." });
  }
});

// Reset admin password using OTP
app.post("/admin/forgot-password/reset", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: "Email, OTP, and new password are required." });
  }

  if (String(newPassword).length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters." });
  }

  const key = email.toLowerCase();
  const otpEntry = adminResetOtpStore.get(key);

  if (!otpEntry) {
    return res.status(400).json({ error: "No OTP request found. Please request a new OTP." });
  }

  if (Date.now() > otpEntry.expiresAt) {
    adminResetOtpStore.delete(key);
    return res.status(400).json({ error: "OTP expired. Please request a new OTP." });
  }

  if (otpEntry.attemptsLeft <= 0) {
    adminResetOtpStore.delete(key);
    return res.status(429).json({ error: "Too many invalid attempts. Request a new OTP." });
  }

  const isOtpValid = hashOtp(otp) === otpEntry.otpHash;
  if (!isOtpValid) {
    otpEntry.attemptsLeft -= 1;
    adminResetOtpStore.set(key, otpEntry);
    return res.status(400).json({ error: `Invalid OTP. Attempts left: ${otpEntry.attemptsLeft}` });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    let account = await Admin.findOne({ email });
    if (!account) {
      account = await Employee.findOne({ email, role: "Admin" });
    }

    if (!account) {
      adminResetOtpStore.delete(key);
      return res.status(404).json({ error: "Admin account not found." });
    }

    account.password = hashedPassword;
    await account.save();

    adminResetOtpStore.delete(key);
    return res.json({ message: "Password reset successful. Please login with your new password." });
  } catch (err) {
    console.error("Error resetting admin password:", err.message);
    return res.status(500).json({ error: "Failed to reset password." });
  }
});

// Route to fetch all rooms (public)
app.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find(); // Fetch all rooms from the database
    if (rooms.length === 0) {
      return res.status(404).json({ message: "No rooms found" });
    }
    res.json(rooms); // Send the room data as JSON response
  } catch (err) {
    console.error("Error fetching rooms:", err.message);
    res.status(500).json({ error: "An error occurred while fetching rooms" });
  }
});

// Staff (Employee) routes
const employeeController = require("./controllers/employeeController");
app.use("/employee", employeeController);

// Access Customer routes
const CustomerRouter = require("./Routes/customerRoute");
app.use("/Customer", CustomerRouter);

// Access Customer routes
const roomRoutes = require("./Routes/roomRoute");
app.use("/Room", roomRoutes); 

const serviceProviderRoutes = require("./Routes/serviceProviderRoutes");
app.use("/serviceProvider", serviceProviderRoutes);

const ticketRoutes = require("./Routes/ticketRoute");
app.use("/Ticket", ticketRoutes);

const internalChatRoutes = require("./Routes/internalChatRoute");
app.use("/internal-chat", internalChatRoutes);

const aiRoutes = require("./Routes/aiRoute");
app.use("/ai", aiRoutes);

// Error handling for unhandled routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server is up and running on port number: ${PORT}`);
});