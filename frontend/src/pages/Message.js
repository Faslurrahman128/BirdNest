import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Bootstrap JS
import logo from "../Componets/assets/unistaylogo.png";
import "../Componets/CSS/Profile.css";

function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [recipientId, setRecipientId] = useState(""); // This would be dynamically set based on tenant/landlord

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Assuming the recipientId is passed in the URL or elsewhere in the app
    const { recipient } = location.state || {}; // recipient user data
    if (recipient) {
      setRecipientId(recipient._id);
      fetchMessages(recipient._id);
    } else {
      setError("Recipient not found.");
    }
  }, [location, navigate]);

  // Fetch existing chat messages
  const fetchMessages = async (recipientId) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Authentication token is missing. Please log in again.");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8070/messages/${recipientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load messages.");
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Authentication token is missing. Please log in again.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8070/messages/send",
        { recipientId, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        setMessage("");
        fetchMessages(recipientId); // Refresh the chat messages after sending
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send the message.");
    }
  };

  return (
    <>
      <nav className="body">
        <nav className="navbar navbar-expand-lg">
          <div className="container">
            <div className="LOGO-container">
              <a className="nav-link text-warning" href="/">
                <img src={logo} alt="LOGO" width="130" />
              </a>
            </div>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarContent"
              aria-controls="navbarContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarContent">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item"><a className="nav-link" href="/dash">Dashboard</a></li>
                <li className="nav-item"><a className="nav-link" href="/AddRoom">Post Add</a></li>
                <li className="nav-item"><a className="nav-link" href="/RoomList">Properties</a></li>
                <li className="nav-item"><a className="nav-link" href="/Userroom">About Us</a></li>
                <li className="nav-item"><a className="nav-link" href="/maintenance">Blogs</a></li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="profileDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Account
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="profileDropdown">
                    <li><a className="dropdown-item" href="/profile">View Profile</a></li>
                    <li><a className="dropdown-item" href="/MyRoom">My Room</a></li>
                    <li><a className="dropdown-item" href="/MyListings">My Listings</a></li>
                    <li><a className="dropdown-item" href="/MyListings">Rate Us</a></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      {sessionStorage.getItem("token") && (
                        <button className="dropdown-item" onClick={() => {
                          sessionStorage.removeItem("token");
                          navigate("/login", { replace: true });
                        }}><strong>Logout</strong></button>
                      )}
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="chat-container p-3">
          <h2>Chat with {recipientId ? "Recipient" : "No Recipient"}</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="messages-box">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div key={index} className={`message ${msg.senderId === recipientId ? "sent" : "received"}`}>
                  <p>{msg.text}</p>
                </div>
              ))
            ) : (
              <p>No messages yet. Start the conversation!</p>
            )}
          </div>

          <form onSubmit={handleSendMessage}>
            <div className="mb-3">
              <textarea
                name="message"
                className="form-control"
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Send</button>
          </form>
        </div>
      </nav>
    </>
  );
}

export default ChatPage;
