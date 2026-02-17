import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation } from "react-router-dom";

function CustomerCareDashboard() {
  const location = useLocation();
  const message1 = location.state?.message || "";
  const [feedbacks, setFeedbacks] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = sessionStorage.getItem("customerCareToken");
  console.log("CustomerCareToken:", token); // Debug log

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8070/customer-care/feedbacks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched feedbacks:", response.data); // Debug log
        setFeedbacks(response.data);
      } catch (error) {
        console.error("Error fetching feedbacks:", error.response?.data || error.message);
        setError("Error fetching feedbacks. Please try again later.");
      }
    };

    const fetchTickets = async () => {
      try {
        if (!token) {
          setError("Authentication token missing. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:8070/Ticket/customer-care/tickets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const tickets = response.data;
        console.log("Fetched tickets:", tickets); // Debug log
        if (!Array.isArray(tickets)) {
          console.error("Tickets response is not an array:", tickets);
          setError("Invalid ticket data received from server.");
          return;
        }
        setInquiries(tickets.filter((ticket) => ticket.category === "Inquiries"));
        setComplaints(tickets.filter((ticket) => ticket.category === "Complaints"));
      } catch (error) {
        console.error("Error fetching tickets:", error.response?.data || error.message);
        setError(`Error fetching tickets: ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
    fetchTickets();
  }, [token]);

  const handleRespondFeedback = async (feedbackId, responseText) => {
    try {
      await axios.put(
        `http://localhost:8070/customer-care/feedbacks/respond/${feedbackId}`,
        { response: responseText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Feedback response sent successfully!");
      setFeedbacks((prevFeedbacks) =>
        prevFeedbacks.map((feedback) =>
          feedback._id === feedbackId
            ? { ...feedback, response: responseText }
            : feedback
        )
      );
    } catch (err) {
      alert("Error responding to feedback: " + (err.response?.data?.error || err.message));
    }
  };

  const handleRespondInquiry = async (ticketId, responseText, status) => {
    try {
      await axios.put(
        `http://localhost:8070/Ticket/customer-care/tickets/respond/${ticketId}`,
        { response: responseText, status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Inquiry response sent successfully!");
      setInquiries((prevInquiries) =>
        prevInquiries.map((ticket) =>
          ticket._id === ticketId
            ? { ...ticket, response: responseText, status }
            : ticket
        )
      );
    } catch (err) {
      alert("Error responding to inquiry: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <nav className="col-md-2 d-none d-md-block bg-light sidebar">
          <div className="position">
            <ul className="nav flex-column">
              <li className="nav-item">
                <button className="nav-link2 active">
                  Feedback & Ticket Management
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          {message1 && <div className="nav-link text-danger">{message1}</div>}

          <section id="feedback-management" className="mb-4">
            <h3>Feedback Management</h3>
            {loading && <p>Loading feedbacks...</p>}
            {error && <div className="alert alert-danger">{error}</div>}
            {feedbacks.length === 0 && !loading && (
              <p>No feedbacks available.</p>
            )}
            {feedbacks.length > 0 && (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Feedback</th>
                    <th>Date</th>
                    <th>Response</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map((feedback) => (
                    <tr key={feedback._id}>
                      <td>{feedback.userName || "N/A"}</td>
                      <td>{feedback.description}</td>
                      <td>{new Date(feedback.createdAt).toLocaleString()}</td>
                      <td>{feedback.response || "No response yet"}</td>
                      <td>
                        <textarea
                          className="form-control mb-2"
                          placeholder="Enter response"
                          defaultValue={feedback.response || ""}
                          onChange={(e) =>
                            handleRespondFeedback(feedback._id, e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section id="inquiries-management" className="mb-4">
            <h3>Inquiries</h3>
            {loading && <p>Loading inquiries...</p>}
            {error && <div className="alert alert-danger">{error}</div>}
            {inquiries.length === 0 && !loading && !error && (
              <p>No inquiries available.</p>
            )}
            {inquiries.length > 0 && (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Response</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((ticket) => (
                    <tr key={ticket._id}>
                      <td>{ticket.userName || "N/A"}</td>
                      <td>{ticket.title}</td>
                      <td>{ticket.priority}</td>
                      <td>{ticket.description}</td>
                      <td>{new Date(ticket.createdAt).toLocaleString()}</td>
                      <td>{ticket.status}</td>
                      <td>{ticket.response || "No response yet"}</td>
                      <td>
                        <textarea
                          className="form-control mb-2"
                          placeholder="Enter response"
                          defaultValue={ticket.response || ""}
                          onChange={(e) =>
                            handleRespondInquiry(ticket._id, e.target.value, ticket.status)
                          }
                        />
                        <select
                          className="form-control"
                          value={ticket.status}
                          onChange={(e) =>
                            handleRespondInquiry(ticket._id, ticket.response, e.target.value)
                          }
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section id="complaints-management" className="mb-4">
            <h3>Complaints</h3>
            {loading && <p>Loading complaints...</p>}
            {error && <div className="alert alert-danger">{error}</div>}
            {complaints.length === 0 && !loading && !error && (
              <p>No complaints available.</p>
            )}
            {complaints.length > 0 && (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((ticket) => (
                    <tr key={ticket._id}>
                      <td>{ticket.userName || "N/A"}</td>
                      <td>{ticket.title}</td>
                      <td>{ticket.priority}</td>
                      <td>{ticket.description}</td>
                      <td>{new Date(ticket.createdAt).toLocaleString()}</td>
                      <td>{ticket.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default CustomerCareDashboard;