import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigat
import "../Componets/CSS/Admindash.css";
import logo from "../Componets/assets/unistaylogo.png";

function AdminDashboard() {
  const location = useLocation();
  const message1 = location.state?.message || "";
  const [activeSection, setActiveSection] = useState("room");
  const [unverifiedRooms, setUnverifiedRooms] = useState([]);
  const [verifiedRooms, setVerifiedRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const navigate = useNavigate(); // Initialize useNavigate

  // Admin Registration States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [lname, setLName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState("");

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8070/rooms", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const roomsData = response.data;

        const verified = roomsData.filter((room) => room.isVerified);
        const unverified = roomsData.filter((room) => !room.isVerified);

        setVerifiedRooms(verified);
        setUnverifiedRooms(unverified);
        setLoading(false);
      } catch (error) {
        setError("Error fetching rooms. Please try again later.");
        setLoading(false);
      }
    };

    fetchRooms();
  }, [token]);

  const handleSectionClick = (section) => {
    setActiveSection(section);
    setSelectedRoom(null); // Reset selected room when switching sections
    setRegistrationMessage(""); // Reset registration message
  };

  const handleRoomClick = (room) => {
    setSelectedRoom((prevRoom) =>
      prevRoom && prevRoom._id === room._id ? null : room
    );
    setActiveImageIndex(0); // Reset image index when selecting a new room
  };

  const handleThumbnailClick = (index) => {
    setActiveImageIndex(index);
  };

  const handleVerification = async (id) => {
    if (!token) {
      alert("Authorization token is missing. Please log in again.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8070/Room/verify/${id}`,
        { isVerified: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const verifiedRoom = unverifiedRooms.find((room) => room._id === id);
        setUnverifiedRooms((prevRooms) => prevRooms.filter((room) => room._id !== id));
        setVerifiedRooms((prevRooms) => [...prevRooms, verifiedRoom]);
        alert("Room successfully verified!");
      } else {
        alert("Failed to update room status.");
      }
    } catch (err) {
      alert("Error updating room status: " + (err.response?.data?.error || err.message));
    }
  };

  const handleAdminRegistration = async (e) => {
    e.preventDefault();

    if (!name || !phoneNumber || !email || !password) {
      setRegistrationMessage("Please fill out all required fields (First Name, Phone Number, Email, Password).");
      return;
    }

    if (password !== confirmPassword) {
      setRegistrationMessage("Passwords do not match. Please try again.");
      return;
    }

    const newAdmin = {
      name,
      email,
      password,
      lname,
      phoneNumber,
      createdAt,
    };

    try {
      await axios.post("http://localhost:8070/Adminregister", newAdmin, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRegistrationMessage("Admin registration successful!");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setLName("");
      setPhoneNumber("");
      setCreatedAt("");
    } catch (err) {
      setRegistrationMessage(
        err.response ? err.response.data.error : "An error occurred during registration."
      );
    }
  };

    // Logout function
    const handleLogout = () => {
      // Remove token from sessionstorage
      sessionStorage.removeItem("token");
      // Redirect to login page
      navigate("/StaffLogin", { replace: true });
    };
  


  return (
    <div className="container-fluid">
      <div className="row">
        <nav className="col-md-2 d-none d-md-block sidebar">
          <div className="sidebar-sticky">
            <ul className="nav flex-column">
            <div className="LOGO-container">
                  <a className="nav-link text-warning" href="/">
                <img src={logo} alt="LOGO" width="130" />
              </a>
            </div>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeSection === "staff" ? "active" : ""}`}
                  onClick={() => handleSectionClick("staff")}
                >
                  Staff Management
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeSection === "room" ? "active" : ""}`}
                  onClick={() => handleSectionClick("room")}
                >
                  Room Verification
                  {unverifiedRooms.length > 0 && (
                    <span className="badge bg-danger ms-2">{unverifiedRooms.length}</span>
                  )}
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeSection === "admin" ? "active" : ""}`}
                  onClick={() => handleSectionClick("admin")}
                >
                  Staff Registration
                </button>
              </li>
              <li>
                  {sessionStorage.getItem("token") && (
                    <button className="nav-link" onClick={handleLogout}><strong>Logout</strong></button> 
                )}
                  </li>
            </ul>
          </div>
        </nav>

        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          {message1 && <div className="alert alert-danger">{message1}</div>}

          {/* Room Management Section */}
          {activeSection === "room" && (
            <section id="room-management" className="mb-4">
              <h3 className="title">Room Management</h3>
              {unverifiedRooms.length > 0 && (
                <div className="alert alert-warning text-center">
                  ⚠️ There are {unverifiedRooms.length} unverified rooms waiting for approval.
                </div>
              )}

              {/* Unverified Rooms */}
              <h4>Unverified Rooms</h4>
              {loading ? (
                <p>Loading rooms...</p>
              ) : error ? (
                <p className="text-danger">{error}</p>
              ) : unverifiedRooms.length === 0 ? (
                <p>No unverified rooms available.</p>
              ) : (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Room Type</th>
                      <th>Address</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unverifiedRooms.map((room) => (
                      <React.Fragment key={room._id}>
                        <tr onClick={() => handleRoomClick(room)} style={{ cursor: "pointer" }}>
                          <td>{room.roomType} - {room.ownerName || "N/A"}</td>
                          <td>{room.roomAddress}</td>
                          <td>Rs {room.price.toLocaleString()}</td>
                        </tr>
                        {selectedRoom?._id === room._id && (
                          <tr>
                            <td colSpan="3">
                              <div className="accordion-body">
                                <img
                                  src={`http://localhost:8070${room.images[activeImageIndex]}`}
                                  alt={`Room ${activeImageIndex + 1}`}
                                  className=" promoters d-block w-100"
                                  style={{
                                    maxWidth: "400px",
                                    maxHeight: "200px",
                                    margin: "auto",
                                    borderRadius: "10px",
                                    marginTop: "15px",
                                  }}
                                />
                                <div className="row mt-3 justify-content-center">
                                  {room.images.map((image, index) => (
                                    <div key={index} className="col-1">
                                      <img
                                        src={`http://localhost:8070${image}`}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="img-thumbnail"
                                        onClick={() => handleThumbnailClick(index)}
                                      />
                                    </div>
                                  ))}
                                </div>
                                <p>
                                  <strong>Posted On:</strong>{" "}
                                  {new Date(room.createdAt).toLocaleString()}
                                </p>
                                <p>
                                  <strong>Owner Name:</strong> {room.ownerName || "N/A"}
                                </p>
                                <p>
                                  <strong>Owner Contact:</strong>{" "}
                                  {room.ownerContactNumber || "N/A"}
                                </p>
                                <p>
                                  <strong>Located City:</strong> {room.roomCity || "N/A"}
                                </p>
                                <p>
                                  <strong>Negotiable:</strong>{" "}
                                  {room.isNegotiable ? "Yes" : "No"}
                                </p>
                                <p>
                                  <strong>Description:</strong> {room.description || "N/A"}
                                </p>
                                <div className="mt-3">
                                  <h5>
                                    <strong>Rating History</strong>
                                  </h5>
                                  {room.ratingHistory && room.ratingHistory.length > 0 ? (
                                    room.ratingHistory.map((rating, index) => (
                                      <div key={index}>
                                        <div>
                                          <strong>Buyer Name:</strong> {rating.buyerName}
                                          <div>
                                            <strong>Rating:</strong>
                                            {Array.from({ length: 5 }, (_, starIndex) => (
                                              <span
                                                key={starIndex}
                                                style={{
                                                  fontSize: "20px",
                                                  color:
                                                    starIndex < rating.rating
                                                      ? "#FFD700"
                                                      : "#D3D3D3",
                                                  cursor: "pointer",
                                                }}
                                              >
                                                ★
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                        <strong>Description:</strong> {rating.description}
                                        <hr style={{ margin: "10px 0", borderTop: "1px solid #ccc" }} />
                                      </div>
                                    ))
                                  ) : (
                                    <p>No ratings yet.</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleVerification(room._id)}
                                  className="approve-btn"
                                >
                                  Approve ✅
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Verified Rooms */}
              <h4>Verified Rooms</h4>
              {loading ? (
                <p>Loading rooms...</p>
              ) : error ? (
                <p className="text-danger">{error}</p>
              ) : verifiedRooms.length === 0 ? (
                <p>No verified rooms available.</p>
              ) : (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Room Type</th>
                      <th>Location</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifiedRooms.map((room) => (
                      <React.Fragment key={room._id}>
                        <tr onClick={() => handleRoomClick(room)} style={{ cursor: "pointer" }}>
                          <td>{room.roomType} - {room.ownerName || "N/A"}</td>
                          <td>{room.roomCity}</td>
                          <td>Rs {room.price.toLocaleString()}</td>
                        </tr>
                        {selectedRoom?._id === room._id && (
                          <tr>
                            <td colSpan="3">
                              <div className="accordion-body">
                                <img
                                  src={`http://localhost:8070${room.images[activeImageIndex]}`}
                                  alt={`Room ${activeImageIndex + 1}`}
                                  className="d-block w-100"
                                  style={{
                                    maxWidth: "400px",
                                    maxHeight: "200px",
                                    margin: "auto",
                                    borderRadius: "10px",
                                    marginTop: "15px",
                                  }}
                                />
                                <div className="row mt-3 justify-content-center">
                                  {room.images.map((image, index) => (
                                    <div key={index} className="col-1">
                                      <img
                                        src={`http://localhost:8070${image}`}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="img-thumbnail"
                                        onClick={() => handleThumbnailClick(index)}
                                      />
                                    </div>
                                  ))}
                                </div>
                                <p>
                                  <strong>Owner Name:</strong> {room.ownerName || "N/A"}
                                </p>
                                <p>
                                  <strong>Owner Contact:</strong>{" "}
                                  {room.ownerContactNumber || "N/A"}
                                </p>
                                <p>
                                  <strong>Listed On:</strong>{" "}
                                  {new Date(room.createdAt).toLocaleString()}
                                </p>
                                <p>
                                  <strong>Room Address:</strong> {room.roomAddress || "N/A"}
                                </p>
                                <p>
                                  <strong>Negotiable:</strong>{" "}
                                  {room.isNegotiable ? "Yes" : "No"}
                                </p>
                                <p>
                                  <strong>Description:</strong> {room.description || "N/A"}
                                </p>
                                <button className="approve-btn">Approved ✅</button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}

          {/* Staff Management Section */}
          {activeSection === "staff" && (
            <section id="staff-management" className="mb-4">
              <h3>Staff Management</h3>
              <p>Placeholder for Staff Management functionality.</p>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Role</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>John Doe</td>
                    <td>Administrator</td>
                    <td>john@example.com</td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}

          {/* Admin Registration Section */}
          {activeSection === "admin" && (
            <section id="admin-registration" className="mb-4">
              <h3 className="title">Staff Registration</h3>
              {registrationMessage && (
                <div
                  className={`alert ${
                    registrationMessage.includes("successful")
                      ? "alert-success"
                      : "alert-danger"
                  }`}
                >
                  {registrationMessage}
                </div>
              )}
              <div className="registration-container accordion-body">
                <form onSubmit={handleAdminRegistration}>

                  <div className="row mb-3">
                    <div className="col">
                      <label htmlFor="firstname" className="form-label">
                        First Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="firstname"
                        placeholder="First name"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        required
                      />
                    </div>
                    <div className="col">
                      <label htmlFor="lastname" className="form-label">
                        Last Name (Optional)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="lastname"
                        placeholder="Last name"
                        onChange={(e) => setLName(e.target.value)}
                        value={lname}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <label htmlFor="phonenumber" className="form-label">
                        Phone Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phonenumber"
                        placeholder="Phone number"
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        value={phoneNumber}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="useremail" className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="useremail"
                      placeholder="Email"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                      required
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <label htmlFor="userpassword" className="form-label">
                        Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="userpassword"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        required
                      />
                    </div>
                    <div className="col">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        placeholder="Confirm Password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        value={confirmPassword}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Register
                  </button>
                </form>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;