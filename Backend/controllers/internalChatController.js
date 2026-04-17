const Admin = require("../models/Admin");
const Employee = require("../models/Employee");
const InternalChatMessage = require("../models/InternalChatMessage");

const EDIT_WINDOW_MINUTES = Number(process.env.INTERNAL_CHAT_EDIT_WINDOW_MINUTES || 10);
const EDIT_WINDOW_MS = Math.max(1, EDIT_WINDOW_MINUTES) * 60 * 1000;

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

function canModifyWithinWindow(createdAt) {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() <= EDIT_WINDOW_MS;
}

function isParticipant(message, userId) {
  return (
    String(message.senderId) === String(userId) ||
    String(message.receiverId) === String(userId)
  );
}

function isHiddenForUser(message, userId) {
  return (message.hiddenFor || []).some((id) => String(id) === String(userId));
}

function toClientMessage(message) {
  if (!message) return message;
  const msg = message.toObject ? message.toObject() : message;
  return {
    ...msg,
    text: msg.isDeletedForEveryone ? "This message was deleted" : msg.text,
  };
}

exports.getContacts = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole || "";

    const enrichContacts = async (baseContacts) => {
      const enriched = await Promise.all(
        baseContacts.map(async (contact) => {
          const lastMessage = await InternalChatMessage.findOne({
            $or: [
              { senderId: userId, receiverId: contact.id },
              { senderId: contact.id, receiverId: userId },
            ],
            hiddenFor: { $ne: userId },
          })
            .sort({ createdAt: -1 })
            .select("text createdAt isDeletedForEveryone");

          const unreadCount = await InternalChatMessage.countDocuments({
            senderId: contact.id,
            receiverId: userId,
            readAt: null,
            isDeletedForEveryone: { $ne: true },
            hiddenFor: { $ne: userId },
          });

          return {
            ...contact,
            unreadCount,
            lastMessageText: lastMessage
              ? (lastMessage.isDeletedForEveryone ? "This message was deleted" : lastMessage.text)
              : "",
            lastMessageAt: lastMessage?.createdAt || null,
          };
        })
      );

      enriched.sort((a, b) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
      });

      return enriched;
    };

    if (isAdminRole(userRole)) {
      const agents = await Employee.find({ role: "Service_Agent", isActive: { $ne: false } })
        .select("name role")
        .sort({ name: 1 });

      const contacts = await enrichContacts(
        agents.map((a) => ({
          id: a._id,
          name: a.name,
          role: a.role,
        }))
      );

      return res.json({ contacts });
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

      const enrichedContacts = await enrichContacts(contacts);
      return res.json({ contacts: enrichedContacts });
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
      hiddenFor: { $ne: userId },
    }).sort({ createdAt: 1 });

    return res.json({ messages: messages.map(toClientMessage), editWindowMinutes: EDIT_WINDOW_MINUTES });
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

    return res.status(201).json({ message: "Message sent successfully.", data: toClientMessage(message) });
  } catch (error) {
    return res.status(500).json({ error: "Failed to send message." });
  }
};

exports.markConversationRead = async (req, res) => {
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

    const result = await InternalChatMessage.updateMany(
      {
        senderId: otherId,
        receiverId: userId,
        readAt: null,
        isDeletedForEveryone: { $ne: true },
        hiddenFor: { $ne: userId },
      },
      {
        $set: { readAt: new Date() },
      }
    );

    return res.json({ message: "Conversation marked as read.", updated: result.modifiedCount || 0 });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update read status." });
  }
};

exports.editMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole || "";
    const { messageId } = req.params;
    const { text } = req.body;

    if (!messageId) {
      return res.status(400).json({ error: "Message ID is required." });
    }

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "Updated message text is required." });
    }

    if (!isAdminRole(userRole) && !isServiceAgentRole(userRole)) {
      return res.status(403).json({ error: "Access denied. Admin or Service Agent only." });
    }

    const message = await InternalChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found." });
    }

    if (String(message.senderId) !== String(userId)) {
      return res.status(403).json({ error: "Only the sender can edit this message." });
    }

    if (message.isDeletedForEveryone) {
      return res.status(400).json({ error: "Deleted message cannot be edited." });
    }

    if (isHiddenForUser(message, userId)) {
      return res.status(400).json({ error: "Cannot edit a message you deleted for yourself." });
    }

    if (!canModifyWithinWindow(message.createdAt)) {
      return res.status(403).json({
        error: `Message can only be edited within ${EDIT_WINDOW_MINUTES} minutes.`,
        editWindowMinutes: EDIT_WINDOW_MINUTES,
      });
    }

    message.text = String(text).trim();
    message.editedAt = new Date();
    await message.save();

    const io = req.app.get("io");
    const payload = toClientMessage(message);
    if (io) {
      io.to(`user:${String(message.senderId)}`).emit("internal:message-updated", payload);
      io.to(`user:${String(message.receiverId)}`).emit("internal:message-updated", payload);
    }

    return res.json({
      message: "Message edited successfully.",
      data: payload,
      editWindowMinutes: EDIT_WINDOW_MINUTES,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to edit message." });
  }
};

exports.deleteMessageForMe = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole || "";
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({ error: "Message ID is required." });
    }

    if (!isAdminRole(userRole) && !isServiceAgentRole(userRole)) {
      return res.status(403).json({ error: "Access denied. Admin or Service Agent only." });
    }

    const message = await InternalChatMessage.findById(messageId);
    if (!message || !isParticipant(message, userId)) {
      return res.status(404).json({ error: "Message not found." });
    }

    if (!isHiddenForUser(message, userId)) {
      message.hiddenFor = [...(message.hiddenFor || []), userId];
      await message.save();
    }

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${String(userId)}`).emit("internal:message-deleted-for-me", {
        messageId: String(message._id),
        userId: String(userId),
      });
    }

    return res.json({ message: "Message deleted for you.", messageId: String(message._id) });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete message for you." });
  }
};

exports.deleteMessageForEveryone = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole || "";
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({ error: "Message ID is required." });
    }

    if (!isAdminRole(userRole) && !isServiceAgentRole(userRole)) {
      return res.status(403).json({ error: "Access denied. Admin or Service Agent only." });
    }

    const message = await InternalChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found." });
    }

    if (String(message.senderId) !== String(userId)) {
      return res.status(403).json({ error: "Only the sender can delete this message for everyone." });
    }

    if (message.isDeletedForEveryone) {
      return res.json({ message: "Message was already deleted for everyone.", data: toClientMessage(message) });
    }

    if (!canModifyWithinWindow(message.createdAt)) {
      return res.status(403).json({
        error: `Message can only be deleted for everyone within ${EDIT_WINDOW_MINUTES} minutes.`,
        editWindowMinutes: EDIT_WINDOW_MINUTES,
      });
    }

    message.isDeletedForEveryone = true;
    message.deletedForEveryoneAt = new Date();
    message.editedAt = null;
    message.text = "This message was deleted";
    await message.save();

    const io = req.app.get("io");
    const payload = toClientMessage(message);
    if (io) {
      io.to(`user:${String(message.senderId)}`).emit("internal:message-updated", payload);
      io.to(`user:${String(message.receiverId)}`).emit("internal:message-updated", payload);
    }

    return res.json({
      message: "Message deleted for everyone.",
      data: payload,
      editWindowMinutes: EDIT_WINDOW_MINUTES,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete message for everyone." });
  }
};
