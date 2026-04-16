import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const roleTitle = useMemo(() => {
    if (role === "service_agent") return "Service Agent";
    if (role === "admin") return "Admin";
    return "Internal";
  }, [role]);

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

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8070/internal-chat/contacts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = response.data.contacts || [];
      setContacts(list);
      if (list.length > 0) {
        setSelectedContact(list[0]);
        await fetchConversation(list[0].id);
      }
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
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load messages.");
    }
  };

  const handleSelectContact = async (contact) => {
    setSelectedContact(contact);
    await fetchConversation(contact.id);
  };

  const handleSend = async () => {
    if (!selectedContact || !messageText.trim()) return;

    try {
      await axios.post(
        "http://localhost:8070/internal-chat/send",
        {
          receiverId: selectedContact.id,
          text: messageText,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessageText("");
      await fetchConversation(selectedContact.id);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to send message.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <AppHeader appName="Bird Nest" tagline={`${roleTitle} Internal Chat`} />

      <div style={{ width: "95%", maxWidth: 1200, margin: "16px auto" }}>
        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: 10, borderRadius: 8, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 12, minHeight: 520 }}>
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
                  <div style={{ fontWeight: 700, color: "#1e293b" }}>{contact.name}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{contact.role}</div>
                </button>
              ))
            )}
          </div>

          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", minHeight: 520, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
              <strong>
                {selectedContact ? `Chat with ${selectedContact.name}` : "Select a contact"}
              </strong>
            </div>

            <div style={{ flex: 1, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.length === 0 ? (
                <p style={{ color: "#64748b" }}>No messages yet.</p>
              ) : (
                messages.map((msg) => {
                  const mine =
                    (myId && String(msg.senderId) === String(myId)) ||
                    msg.senderName === username;
                  return (
                    <div
                      key={msg._id}
                      style={{
                        alignSelf: mine ? "flex-end" : "flex-start",
                        maxWidth: "72%",
                        background: mine ? "#1a237e" : "#e2e8f0",
                        color: mine ? "#fff" : "#1e293b",
                        padding: "10px 12px",
                        borderRadius: 10,
                      }}
                    >
                      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>
                        {msg.senderName} ({msg.senderRole})
                      </div>
                      <div>{msg.text}</div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ padding: 12, borderTop: "1px solid #e2e8f0", display: "flex", gap: 8 }}>
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1, border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
              />
              <button
                onClick={handleSend}
                style={{ border: "none", background: "#1a237e", color: "#fff", borderRadius: 8, padding: "10px 16px", fontWeight: 700 }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InternalChat;
