import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Componets/CSS/MessagePage.css';
import { Send } from "lucide-react";
import logo from "../Componets/assets/unistaylogo.png";

const MessagePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [roomId, setRoomId] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Set roomId from location state
  useEffect(() => {
    if (location.state && location.state.roomId) {
      setRoomId(location.state.roomId);
    }
  }, [location]);

  // Fetch chat history when roomId changes
  useEffect(() => {
    if (roomId) {
      fetchChatHistory();
    }
  }, [roomId]);

  const fetchChatHistory = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setError('Authentication token is missing.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8070/room/chatHistory?roomId=${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Find the correct room chat history
      const roomChat = response.data.find(chat => chat.roomId === roomId);
      console.log("Fetched Room Chat:", roomChat); // Debugging log

      if (roomChat && roomChat.chatHistory) {
        setChatHistory(roomChat.chatHistory);
      } else {
        setChatHistory([]);
      }
    } catch (err) {
      console.error("Error fetching chat history:", err);
      setError("An error occurred while fetching chat history.");
    }
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const sendMessage = async () => {
    if (!roomId || !message) {
      setError("Room ID and message are required.");
      return;
    }

    const token = sessionStorage.getItem('token');
    if (!token) {
      setError('Authentication token is missing.');
      return;
    }

    try {
      await axios.post('http://localhost:8070/room/sendmessage', { roomId, message }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMessage("Message sent successfully!");
      setError('');
      setMessage('');
      
      fetchChatHistory(); // Refresh chat history after sending a message
    } catch (err) {
      setError("An error occurred while sending the message.");
      setSuccessMessage('');
    }
  };

  // Logout function
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
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
                  <a className="nav-link dropdown-toggle" href="#" id="profileDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
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
                        <button className="dropdown-item" onClick={handleLogout}><strong>Logout</strong></button>
                      )}
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="container-fluid message-page h-100">
          <div className="row h-100">
            <div className="col-12 col-md-10 col-lg-8 mx-auto d-flex flex-column h-100">
              {/* Header */}
              <div className="message-header p-3 shadow-sm">
                <h4 className="mb-0">Chat Room {roomId}</h4>
              </div>

              {/* Alerts */}
              {error && <div className="alert alert-danger mt-3">{error}</div>}
              {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}

              {/* Chat History */}
              <div className="chat-container flex-grow-1 p-3">
                {chatHistory.length > 0 ? (
                  chatHistory.map((msg, index) => (
                    <div key={index} className="message-bubble mb-3">
                      <div className="messaging-content p-3">
                        <p className="message mb-1">{msg.message}</p>
                        <small className="text-muted">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "Unknown time"}
                        </small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted py-5">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="message-input p-3 border-top">
                <div className="input-group">
                  <textarea
                    className="form-control"
                    rows="2"
                    value={message}
                    onChange={handleMessageChange}
                    placeholder="Type your message..."
                  />
                  <button className="btn me-1" onClick={sendMessage}>
                    <Send size={25} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default MessagePage;
