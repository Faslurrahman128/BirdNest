import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Componets/CSS/Ticket.css";
import AppHeader from "../Componets/AppHeader";

function RaiseTicket() {
  const [issueTitle, setIssueTitle] = useState("");
  const [issueCategory, setIssueCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to raise a ticket.");
      return;
    }

    if (!issueTitle || !issueCategory || !priority || !description) {
      alert("Please fill out all required fields.");
      return;
    }

    const formData = {
      title: issueTitle,
      category: issueCategory,
      priority: priority,
      description: description,
    };

    try {
      const response = await axios.post("http://localhost:8070/Ticket/raise", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      alert(response.data.message);

      navigate("/MyTickets");

      setIssueTitle("");
      setIssueCategory("");
      setPriority("");
      setDescription("");
    } catch (error) {
      console.error("Error raising ticket:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || "Error raising the ticket. Please try again later.";
      alert(errorMessage);
    }
  };

  const handlePriorityChange = (e) => {
    setPriority(e.target.value);
  };

  return (
    <>
      <AppHeader
        appName="Bird Nest"
        tagline="Find Your Perfect Space"
        showLogout={!!sessionStorage.getItem("token")}
      />

      <div className="RaiseTicket-container">
        <h2 className="mt-1">Raise a Support Ticket</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Issue Title *</label>
            <input
              type="text"
              className="form-control"
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Category *</label>
            <select
              className="form-control"
              value={issueCategory}
              onChange={(e) => setIssueCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              <option value="Inquiries">Inquiries</option>
              <option value="Complaints">Complaints</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="prioritySelect" className="form-label">
              Priority *
            </label>
            <select
              id="prioritySelect"
              className={`form-control ${priority === "High" ? "high-priority" : ""}`}
              value={priority}
              onChange={handlePriorityChange}
              required
            >
              <option value="">Select Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Description *</label>
            <textarea
              className="form-control"
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary w-100">Submit Ticket</button>
        </form>
      </div>
    </>
  );
}

export default RaiseTicket;