const Admin = require("../models/Admin");
const Employee = require("../models/Employee");
const InternalChatMessage = require("../models/InternalChatMessage");

const normalizeRole = (role = "") => role.toString().toLowerCase();

async function resolveIdentityById(id) {
  const admin = await Admin.findById(id).select("name email isActive");
  if (admin) {
    return {
      id: admin._id,
      name: admin.name || "Admin",
      role: "admin",
      isActive: admin.isActive !== false,
      source: "Admin",
    };
  }

  const employee = await Employee.findById(id).select("name email role isActive");
  if (employee) {
    return {
      id: employee._id,
      name: employee.name || "Staff",
      role: employee.role || "Staff",
      isActive: employee.isActive !== false,
      source: "Employee",
    };
  }

  return null;
}

function isAdminRole(role = "") {
  return normalizeRole(role) === "admin";
}

function isServiceAgentRole(role = "") {
  return normalizeRole(role) === "service_agent";
}

exports.getContacts = async (req, res) => {
  try {
    const userRole = req.userRole || "";

    if (isAdminRole(userRole)) {
      const agents = await Employee.find({ role: "Service_Agent", isActive: { $ne: false } })
        .select("name role")
        .sort({ name: 1 });

      return res.json({
        contacts: agents.map((a) => ({
          id: a._id,
          name: a.name,
          role: a.role,
        })),
      });
    }

    if (isServiceAgentRole(userRole)) {
      const adminEmployees = await Employee.find({ role: "Admin", isActive: { $ne: false } })
        .select("name role")
        .sort({ name: 1 });
      const admins = await Admin.find({ isActive: { $ne: false } }).select("name").sort({ name: 1 });

      const contacts = [
        ...adminEmployees.map((a) => ({ id: a._id, name: a.name, role: a.role })),
        ...admins.map((a) => ({ id: a._id, name: a.name, role: "Admin" })),
      ];

      return res.json({ contacts });
    }

    return res.status(403).json({ error: "Access denied. Admin or Service Agent only." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load chat contacts." });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole || "";
    const { otherId } = req.params;

    if (!otherId) {
      return res.status(400).json({ error: "Contact ID is required." });
    }

    if (!isAdminRole(userRole) && !isServiceAgentRole(userRole)) {
      return res.status(403).json({ error: "Access denied. Admin or Service Agent only." });
    }

    const messages = await InternalChatMessage.find({
      $or: [
        { senderId: userId, receiverId: otherId },
        { senderId: otherId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    return res.json({ messages });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load conversation." });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const senderRole = req.userRole || "";
    const { receiverId, text } = req.body;

    if (!receiverId || !text || !text.trim()) {
      return res.status(400).json({ error: "Receiver and message are required." });
    }

    if (!isAdminRole(senderRole) && !isServiceAgentRole(senderRole)) {
      return res.status(403).json({ error: "Access denied. Admin or Service Agent only." });
    }

    const senderIdentity = await resolveIdentityById(senderId);
    const receiverIdentity = await resolveIdentityById(receiverId);

    if (!senderIdentity || !receiverIdentity) {
      return res.status(404).json({ error: "Sender or receiver account not found." });
    }

    if (!senderIdentity.isActive || !receiverIdentity.isActive) {
      return res.status(403).json({ error: "Cannot send messages from or to deactivated accounts." });
    }

    const senderIsAdmin = isAdminRole(senderIdentity.role);
    const senderIsAgent = isServiceAgentRole(senderIdentity.role);
    const receiverIsAdmin = isAdminRole(receiverIdentity.role);
    const receiverIsAgent = isServiceAgentRole(receiverIdentity.role);

    const validPair =
      (senderIsAdmin && receiverIsAgent) ||
      (senderIsAgent && receiverIsAdmin);

    if (!validPair) {
      return res.status(403).json({ error: "Only admin and service agent can chat with each other." });
    }

    const message = await InternalChatMessage.create({
      senderId: senderIdentity.id,
      senderRole: senderIdentity.role,
      senderName: senderIdentity.name,
      receiverId: receiverIdentity.id,
      receiverRole: receiverIdentity.role,
      receiverName: receiverIdentity.name,
      text: text.trim(),
    });

    return res.status(201).json({ message: "Message sent successfully.", data: message });
  } catch (error) {
    return res.status(500).json({ error: "Failed to send message." });
  }
};
