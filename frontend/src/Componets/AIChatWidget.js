import React, { useMemo, useState } from "react";
import axios from "axios";
import "./CSS/AIChatWidget.css";
import appLogo from "./assets/APPLOGO.png";

const QUICK_CHIPS = [
  "Free ChatGPT (chatgpt.com)",
  "Without account option",
  "Limit: 10 msgs/5h",
  "GPT-5.2 model",
  "No API billing",
  "⚠️ Your data trains OpenAI",
];

function AIChatWidget() {
  const token = sessionStorage.getItem("token");
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi, I am your BirdNest assistant. I can help with rooms, pricing, and app guidance.",
    },
  ]);

  const chatHistoryPayload = useMemo(
    () => messages.map((m) => ({ role: m.role, content: m.content })),
    [messages]
  );

  const sendMessage = async (raw) => {
    const userText = String(raw || "").trim();
    if (!userText || loading) return;

    const nextMessages = [...messages, { role: "user", content: userText }];
    setMessages(nextMessages);
    setText("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8070/ai/chat",
        {
          message: userText,
          history: nextMessages,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.reply || "No response." },
      ]);
    } catch (err) {
      const message = err?.response?.data?.error || "Assistant is temporarily unavailable.";
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-root">
      {isOpen && (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <div>
              <div className="ai-chat-title">BirdNest AI</div>
              <div className="ai-chat-subtitle">No-cost local assistant</div>
            </div>
            <button className="ai-chat-close" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="ai-chat-chips">
            {QUICK_CHIPS.map((chip) => (
              <button key={chip} onClick={() => sendMessage(chip)}>{chip}</button>
            ))}
          </div>

          <div className="ai-chat-messages">
            {messages.map((m, idx) => (
              <div key={`${m.role}-${idx}`} className={`ai-chat-msg ${m.role}`}>
                {m.content}
              </div>
            ))}
            {loading && <div className="ai-chat-msg assistant">Thinking...</div>}
          </div>

          <div className="ai-chat-input-row">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask anything about rooms..."
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage(text);
              }}
            />
            <button onClick={() => sendMessage(text)} disabled={loading}>Send</button>
          </div>
        </div>
      )}

      <button className="ai-chat-fab" onClick={() => setIsOpen((v) => !v)} title="Open BirdNest AI">
        <img src={appLogo} alt="Bird Nest AI" className="ai-chat-fab-logo" />
      </button>
    </div>
  );
}

export default AIChatWidget;
