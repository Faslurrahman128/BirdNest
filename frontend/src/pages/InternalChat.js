import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import AppHeader from "../Componets/AppHeader";

function InternalChat() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const role = (sessionStorage.getItem("role") || sessionStorage.getItem("staffRole") || "").toLowerCase();
  const username = sessionStorage.getItem("staffName") || "User";
  const myId = sessionStorage.getItem("userId") || "";

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [editWindowMinutes, setEditWindowMinutes] = useState(10);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [openMenuMessageId, setOpenMenuMessageId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [toasts, setToasts] = useState([]);

  const socketRef = React.useRef(null);
  const selectedContactRef = React.useRef(null);
  const typingTimeoutRef = React.useRef(null);
  const toastTimeoutsRef = React.useRef([]);
  const chatScrollRef = useRef(null);

  const roleTitle = useMemo(() => {
    if (role === "service_agent") return "Service Agent";
    if (role === "admin") return "Admin";
    return "Internal";
  }, [role]);

  const pushToast = (text) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text }]);
    const timeoutId = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
    toastTimeoutsRef.current.push(timeoutId);
  };

  const formatContactTime = (dateValue) => {
    if (!dateValue) return "";
    const d = new Date(dateValue);
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    if (sameDay) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString();
  };

  const sortContactsByRecent = (list) => {
    return [...list].sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });
  };

  const isMineMessage = (msg) => {
    return (myId && String(msg.senderId) === String(myId)) || msg.senderName === username;
  };

  const isWithinEditWindow = (createdAt) => {
    if (!createdAt) return false;
    return Date.now() - new Date(createdAt).getTime() <= editWindowMinutes * 60 * 1000;
  };

  const updateContactPreview = (msg) => {
    const contactId =
      String(msg.senderId) === String(myId)
        ? String(msg.receiverId)
        : String(msg.senderId);

    setContacts((prev) => {
      const updated = prev.map((c) =>
        String(c.id) === contactId
          ? {
              ...c,
              lastMessageText: msg.text,
              lastMessageAt: msg.updatedAt || msg.createdAt || c.lastMessageAt,
            }
          : c
      );
      return sortContactsByRecent(updated);
    });
  };

  const scrollToBottom = () => {
    if (!chatScrollRef.current) return;
    requestAnimationFrame(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    });
  };

  useEffect(() => {
    if (!token) {
      navigate("/AdminLogin", { replace: true });
      return;
    }

    if (!["admin", "service_agent"].includes(role)) {
      setError("Access denied. This chat is only for Admin and Service Agent.");
      setLoading(false);
      return;
    }

    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role]);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    if (!selectedContact) return;
    scrollToBottom();
  }, [messages, isPeerTyping, selectedContact?.id]);

  useEffect(() => {
    const closeMenu = () => setOpenMenuMessageId(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  useEffect(() => {
    if (!token || !["admin", "service_agent"].includes(role)) return;

    const socket = io("http://localhost:8070", {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect_error", () => {
      setError("Realtime chat connection failed.");
    });

    socket.on("internal:new-message", async (msg) => {
      const peerId = selectedContactRef.current?.id;
      const inCurrentConversation =
        peerId &&
        ((String(msg.senderId) === String(peerId) && String(msg.receiverId) === String(myId)) ||
          (String(msg.senderId) === String(myId) && String(msg.receiverId) === String(peerId)));

      const contactId =
        String(msg.senderId) === String(myId)
          ? String(msg.receiverId)
          : String(msg.senderId);

      setContacts((prev) => {
        const updated = prev.map((c) => {
          if (String(c.id) !== contactId) return c;
          const incomingFromPeer = String(msg.senderId) !== String(myId);
          const selectedNow = String(c.id) === String(selectedContactRef.current?.id);
          return {
            ...c,
            lastMessageText: msg.text,
            lastMessageAt: msg.createdAt,
            unreadCount: incomingFromPeer && !selectedNow ? (c.unreadCount || 0) + 1 : (selectedNow ? 0 : (c.unreadCount || 0)),
          };
        });
        return sortContactsByRecent(updated);
      });

      const isIncoming = String(msg.senderId) !== String(myId);
      const inFocusConversation =
        peerId &&
        String(msg.senderId) === String(peerId) &&
        String(msg.receiverId) === String(myId);

      if (isIncoming && !inFocusConversation) {
        pushToast(`New message from ${msg.senderName}: ${msg.text}`);

        if (
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          try {
            new Notification(`Bird Nest Chat - ${msg.senderName}`, {
              body: msg.text,
              tag: `chat-${msg.senderId}`,
            });
          } catch (_) {}
        }
      }

      if (!inCurrentConversation) return;

      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
        return [...prev, msg];
      });

      if (String(msg.senderId) === String(peerId)) {
        socket.emit("internal:read", { withUserId: peerId });
        setIsPeerTyping(false);
      }
    });

    socket.on("internal:typing", ({ fromUserId, isTyping }) => {
      if (String(fromUserId) === String(selectedContactRef.current?.id)) {
        setIsPeerTyping(!!isTyping);
      }
    });

    socket.on("internal:read-update", ({ byUserId, withUserId, readAt }) => {
      if (String(byUserId) !== String(selectedContactRef.current?.id)) return;
      if (String(withUserId) !== String(myId)) return;

      setMessages((prev) =>
        prev.map((m) => {
          const isMineToPeer =
            String(m.senderId) === String(myId) &&
            String(m.receiverId) === String(byUserId) &&
            !m.readAt;

          return isMineToPeer ? { ...m, readAt } : m;
        })
      );
    });

    socket.on("internal:message-updated", (msg) => {
      const peerId = selectedContactRef.current?.id;
      const inCurrentConversation =
        peerId &&
        ((String(msg.senderId) === String(peerId) && String(msg.receiverId) === String(myId)) ||
          (String(msg.senderId) === String(myId) && String(msg.receiverId) === String(peerId)));

      if (inCurrentConversation) {
        setMessages((prev) => prev.map((m) => (String(m._id) === String(msg._id) ? msg : m)));
      }

      updateContactPreview(msg);
    });

    socket.on("internal:message-deleted-for-me", ({ messageId, userId: deletedUserId }) => {
      if (deletedUserId && String(deletedUserId) !== String(myId)) return;
      setMessages((prev) => prev.filter((m) => String(m._id) !== String(messageId)));
      if (String(editingMessageId) === String(messageId)) {
        setEditingMessageId(null);
        setEditingText("");
      }
    });

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      toastTimeoutsRef.current.forEach((id) => clearTimeout(id));
      toastTimeoutsRef.current = [];
      socket.disconnect();
    };
  }, [token, role, myId]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8070/internal-chat/contacts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = response.data.contacts || [];
      setContacts(list);
      setSelectedContact(null);
      setMessages([]);
      setIsPeerTyping(false);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (otherId) => {
    try {
      const response = await axios.get(`http://localhost:8070/internal-chat/conversation/${otherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data.messages || []);
      setEditWindowMinutes(response.data.editWindowMinutes || 10);

      await axios.put(
        `http://localhost:8070/internal-chat/conversation/${otherId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (socketRef.current && otherId) {
        socketRef.current.emit("internal:read", { withUserId: otherId });
      }

      setContacts((prev) =>
        prev.map((c) =>
          String(c.id) === String(otherId)
            ? { ...c, unreadCount: 0 }
            : c
        )
      );
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load messages.");
    }
  };

  const handleSelectContact = async (contact) => {
    setSelectedContact(contact);
    setEditingMessageId(null);
    setEditingText("");
    setOpenMenuMessageId(null);
    await fetchConversation(contact.id);
    scrollToBottom();
  };

  const handleSend = async () => {
    if (!selectedContact || !messageText.trim()) return;

    try {
      const outgoing = messageText;
      if (socketRef.current) {
        socketRef.current.emit("internal:send", {
          toUserId: selectedContact.id,
          text: outgoing,
        });
      } else {
        await axios.post(
          "http://localhost:8070/internal-chat/send",
          {
            receiverId: selectedContact.id,
            text: outgoing,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      setMessageText("");
      setIsPeerTyping(false);

      setContacts((prev) => {
        const updated = prev.map((c) =>
          String(c.id) === String(selectedContact.id)
            ? {
                ...c,
                lastMessageText: outgoing,
                lastMessageAt: new Date().toISOString(),
              }
            : c
        );
        return sortContactsByRecent(updated);
      });

      if (socketRef.current) {
        socketRef.current.emit("internal:typing", {
          toUserId: selectedContact.id,
          isTyping: false,
        });
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to send message.");
    }
  };

  const handleInputChange = (value) => {
    setMessageText(value);
    if (!selectedContact?.id || !socketRef.current) return;

    socketRef.current.emit("internal:typing", {
      toUserId: selectedContact.id,
      isTyping: value.trim().length > 0,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (!socketRef.current) return;
      socketRef.current.emit("internal:typing", {
        toUserId: selectedContact.id,
        isTyping: false,
      });
    }, 1200);
  };

  const startEditMessage = (msg) => {
    if (!isMineMessage(msg) || msg.isDeletedForEveryone || !isWithinEditWindow(msg.createdAt)) return;
    setEditingMessageId(msg._id);
    setEditingText(msg.text || "");
    setOpenMenuMessageId(null);
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const saveEditedMessage = async (messageId) => {
    if (!editingText.trim()) return;
    try {
      const response = await axios.put(
        `http://localhost:8070/internal-chat/messages/${messageId}/edit`,
        { text: editingText.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updated = response?.data?.data;
      if (updated) {
        setMessages((prev) => prev.map((m) => (String(m._id) === String(updated._id) ? updated : m)));
        updateContactPreview(updated);
      }

      setEditingMessageId(null);
      setEditingText("");
      setOpenMenuMessageId(null);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to edit message.");
    }
  };

  const deleteMessageForMe = async (messageId) => {
    try {
      await axios.put(
        `http://localhost:8070/internal-chat/messages/${messageId}/delete-for-me`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages((prev) => prev.filter((m) => String(m._id) !== String(messageId)));
      if (String(editingMessageId) === String(messageId)) {
        setEditingMessageId(null);
        setEditingText("");
      }
      setOpenMenuMessageId(null);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to delete message.");
    }
  };

  const deleteMessageForEveryone = async (messageId) => {
    try {
      await axios.put(
        `http://localhost:8070/internal-chat/messages/${messageId}/delete-for-everyone`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOpenMenuMessageId(null);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to delete message for everyone.");
    }
  };

  return (
    <div style={{ height: "100vh", background: "#f8fafc", overflow: "hidden" }}>
      <AppHeader appName="Bird Nest" tagline={`${roleTitle} Internal Chat`} />

      <div style={{ width: "95%", maxWidth: 1200, margin: "16px auto", height: "calc(100vh - 110px)", overflow: "hidden" }}>
        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: 10, borderRadius: 8, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, height: error ? "calc(100% - 56px)" : "100%" }}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 12, height: "100%", overflowY: "auto" }}>
            <h4 style={{ marginTop: 0 }}>Contacts</h4>
            {loading ? (
              <p>Loading...</p>
            ) : contacts.length === 0 ? (
              <p style={{ color: "#64748b" }}>No contacts available.</p>
            ) : (
              contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: selectedContact?.id === contact.id ? "1px solid #1a237e" : "1px solid #e2e8f0",
                    background: selectedContact?.id === contact.id ? "#eef2ff" : "#fff",
                    borderRadius: 10,
                    padding: "10px 12px",
                    marginBottom: 8,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div style={{ fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {contact.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", flexShrink: 0 }}>
                      {formatContactTime(contact.lastMessageAt)}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <div style={{ fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {contact.lastMessageText || contact.role}
                    </div>
                    {(contact.unreadCount || 0) > 0 && (
                      <span
                        style={{
                          minWidth: 18,
                          height: 18,
                          borderRadius: 999,
                          background: "#1a237e",
                          color: "#fff",
                          fontSize: 11,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 6px",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {contact.unreadCount > 99 ? "99+" : contact.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
              <strong>
                {selectedContact ? `Chat with ${selectedContact.name}` : "Select a contact"}
              </strong>
            </div>

            <div ref={chatScrollRef} style={{ flex: 1, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              {!selectedContact ? (
                <div style={{ color: "#64748b", textAlign: "center", marginTop: 24 }}>
                  <p style={{ marginBottom: 6, fontWeight: 600 }}>No conversation selected</p>
                  <p style={{ margin: 0 }}>Choose a contact from the left panel to start chatting.</p>
                </div>
              ) : messages.length === 0 ? (
                <p style={{ color: "#64748b" }}>No messages yet.</p>
              ) : (
                messages.map((msg) => {
                  const mine = isMineMessage(msg);
                  const canModifyForEveryone =
                    mine && !msg.isDeletedForEveryone && isWithinEditWindow(msg.createdAt);

                  return (
                    <div
                      key={msg._id}
                      style={{
                        position: "relative",
                        alignSelf: mine ? "flex-end" : "flex-start",
                        maxWidth: "72%",
                        background: msg.isDeletedForEveryone
                          ? "#cbd5e1"
                          : mine
                          ? "#1a237e"
                          : "#e2e8f0",
                        color: mine ? "#fff" : "#1e293b",
                        padding: "10px 12px",
                        borderRadius: 10,
                      }}
                    >
                      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>
                        {msg.senderName} ({msg.senderRole})
                      </div>

                      {editingMessageId !== msg._id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuMessageId((prev) => (prev === msg._id ? null : msg._id));
                          }}
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            border: "none",
                            background: "transparent",
                            color: mine ? "#e2e8f0" : "#475569",
                            fontSize: 18,
                            lineHeight: 1,
                            cursor: "pointer",
                            padding: "0 4px",
                          }}
                          aria-label="Message menu"
                          title="Message menu"
                        >
                          ...
                        </button>
                      )}

                      {openMenuMessageId === msg._id && editingMessageId !== msg._id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: "absolute",
                            top: 34,
                            right: 8,
                            background: "#ffffff",
                            color: "#0f172a",
                            border: "1px solid #e2e8f0",
                            borderRadius: 10,
                            minWidth: 170,
                            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.18)",
                            overflow: "hidden",
                            zIndex: 20,
                          }}
                        >
                          {canModifyForEveryone && (
                            <button
                              onClick={() => startEditMessage(msg)}
                              style={{
                                width: "100%",
                                border: "none",
                                background: "#fff",
                                color: "#0f172a",
                                textAlign: "left",
                                padding: "9px 12px",
                                fontSize: 13,
                                cursor: "pointer",
                              }}
                            >
                              Edit
                            </button>
                          )}

                          {canModifyForEveryone && (
                            <button
                              onClick={() => deleteMessageForEveryone(msg._id)}
                              style={{
                                width: "100%",
                                border: "none",
                                background: "#fff",
                                color: "#b91c1c",
                                textAlign: "left",
                                padding: "9px 12px",
                                fontSize: 13,
                                cursor: "pointer",
                              }}
                            >
                              Delete for everyone
                            </button>
                          )}

                          <button
                            onClick={() => deleteMessageForMe(msg._id)}
                            style={{
                              width: "100%",
                              border: "none",
                              background: "#fff",
                              color: "#0f172a",
                              textAlign: "left",
                              padding: "9px 12px",
                              fontSize: 13,
                              cursor: "pointer",
                            }}
                          >
                            Delete for me
                          </button>
                        </div>
                      )}

                      {editingMessageId === msg._id ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <input
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            style={{
                              border: "1px solid #cbd5e1",
                              borderRadius: 8,
                              padding: "8px 10px",
                              color: "#111827",
                            }}
                          />
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => saveEditedMessage(msg._id)}
                              style={{
                                border: "none",
                                background: "#16a34a",
                                color: "#fff",
                                borderRadius: 7,
                                padding: "6px 10px",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditMessage}
                              style={{
                                border: "none",
                                background: "#64748b",
                                color: "#fff",
                                borderRadius: 7,
                                padding: "6px 10px",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontStyle: msg.isDeletedForEveryone ? "italic" : "normal" }}>{msg.text}</div>
                      )}

                      {mine && (
                        <div style={{ fontSize: 11, marginTop: 4, opacity: 0.85 }}>
                          {msg.editedAt && !msg.isDeletedForEveryone ? "Edited · " : ""}
                          {msg.readAt ? `Seen ${new Date(msg.readAt).toLocaleTimeString()}` : "Sent"}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {isPeerTyping && (
                <div
                  style={{
                    alignSelf: "flex-start",
                    background: "#e2e8f0",
                    color: "#1e293b",
                    padding: "10px 14px",
                    borderRadius: 12,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    width: "fit-content",
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#475569", animation: "typing-bounce 1s infinite 0s" }} />
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#475569", animation: "typing-bounce 1s infinite 0.2s" }} />
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#475569", animation: "typing-bounce 1s infinite 0.4s" }} />
                </div>
              )}
            </div>

            <div style={{ padding: 12, borderTop: "1px solid #e2e8f0", display: "flex", gap: 8 }}>
              <input
                value={messageText}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={selectedContact ? "Type a message..." : "Select a contact to start typing..."}
                style={{ flex: 1, border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px" }}
                disabled={!selectedContact}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && selectedContact) handleSend();
                }}
              />
              <button
                onClick={handleSend}
                disabled={!selectedContact}
                style={{ border: "none", background: "#1a237e", color: "#fff", borderRadius: 8, padding: "10px 16px", fontWeight: 700 }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 9999,
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background: "#0f172a",
              color: "#fff",
              padding: "10px 12px",
              borderRadius: 10,
              minWidth: 260,
              maxWidth: 360,
              boxShadow: "0 10px 30px rgba(2,6,23,0.35)",
              fontSize: 13,
            }}
          >
            {toast.text}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes typing-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.55; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default InternalChat;
