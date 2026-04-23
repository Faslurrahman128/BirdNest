import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../Componets/CSS/./MyListings.css";
import {
  Pencil, Trash2, Eye, RefreshCcw, Download,
  MapPin, Calendar, Tag, MessageSquare, CheckCircle, Home,
} from "lucide-react";
import logo from "../Componets/assets/APPLOGO.png";
import jsPDF from "jspdf";

function LoggedCustomer() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [activeImageIndexes, setActiveImageIndexes] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [unconfirmedBooking, setunconfirmedBooking] = useState([]);
  const [updatedRoomData, setUpdatedRoomData] = useState({
    roomType: "", roomAddress: "", roomCity: "", price: "", description: "", images: [],
  });
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetchRooms();
  }, [navigate]);

  const getActiveIndex = (roomId) => activeImageIndexes[roomId] || 0;

  const handleThumbnailClick = (roomId, index) => {
    setActiveImageIndexes((prev) => ({ ...prev, [roomId]: index }));
  };

  const fetchRooms = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) { setMessage("Please log in."); setAlertType("danger"); navigate("/login"); return; }
    try {
      const response = await axios.get("http://localhost:8070/Room/myrooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to load rooms.");
      setAlertType("danger");
    }
  };

  const handlebVerification = async (id) => {
    const token = sessionStorage.getItem("token");
    if (!token) { alert("Please log in again."); return; }
    try {
      const response = await axios.put(
        `http://localhost:8070/Room/confirmbooking/${id}`,
        { isBookedconfirm: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        alert("Room booking successfully confirmed!");
        fetchRooms();
      } else { alert("Failed to update room booking status."); }
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const handleRepostRoom = async (roomId) => {
    const token = sessionStorage.getItem("token");
    if (!token) { alert("Authentication required."); return; }
    try {
      const response = await axios.put(
        `http://localhost:8070/room/repost/${roomId}`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || "An error occurred.");
    }
  };

  const deleteRoom = async (roomId) => {
    const token = sessionStorage.getItem("token");
    if (!token) { setMessage("Please log in."); setAlertType("danger"); return; }
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        const response = await axios.delete(`http://localhost:8070/Room/delete/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRooms((prev) => prev.filter((room) => room._id !== roomId));
        setMessage(response.data.message || "Room deleted successfully.");
        setAlertType("success");
      } catch (err) {
        setMessage(err.response?.data?.error || "Failed to delete room.");
        setAlertType("danger");
      }
    }
  };

  const updateRoom = async (roomId, formData) => {
    const token = sessionStorage.getItem("token");
    if (!token) { setMessage("Please log in."); setAlertType("danger"); return; }
    try {
      const response = await fetch(`http://localhost:8070/Room/update/${roomId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        alert("Room updated successfully!");
        fetchRooms();
        setSelectedRoom(null);
      } else { alert(`Failed to update room: ${data.error}`); }
    } catch (error) { alert("An error occurred while updating the room."); }
  };

  const handleRoomUpdate = (room) => {
    setSelectedRoom(room);
    setUpdatedRoomData({
      roomType: room.roomType, roomAddress: room.roomAddress, roomCity: room.roomCity,
      price: room.price, description: room.description, images: room.images,
    });
    setImagePreviews([]);
    const modal = new window.bootstrap.Modal(document.getElementById("roomUpdateModal"));
    modal.show();
  };

  const handleRoomFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    imagePreviews.forEach((preview) => { if (preview.file) formData.append("images", preview.file); });
    formData.append("keepImages", JSON.stringify(updatedRoomData.images));
    for (const key in updatedRoomData) { if (key !== "images") formData.append(key, updatedRoomData[key]); }
    updateRoom(selectedRoom._id, formData);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    if (updatedRoomData.images.length + imagePreviews.length + newPreviews.length > 10) {
      alert("You can upload up to 10 images only."); return;
    }
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleImageDelete = (index, isExisting) => {
    if (isExisting) {
      setUpdatedRoomData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    } else {
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleViewBuyerInfo = (room) => {
    setSelectedBuyer(room);
    const modal = new window.bootstrap.Modal(document.getElementById("buyerInfoModal"));
    modal.show();
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const handleGoToMessaging = (roomId, ownerName) => {
    navigate("/chatpage", { state: { roomId, ownerName } });
  };

  const generatePDF = (room) => {
    const doc = new jsPDF();
    doc.setFillColor(6, 57, 112);
    doc.rect(0, 0, 210, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Unistay - Rental Confirmation", 20, 15);
    doc.setTextColor(0, 0, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Thank you for choosing Unistay!", 20, 30);
    doc.text("Your room details are as follows:", 20, 40);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Room Details", 20, 50);
    const margin = 20;
    const detailsWidth = 90;
    const detailsWidth2 = 75;
    const formattedDate = new Date(room.createdAt).toLocaleString();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Owner Name: ${room.ownerName}`, 20, 60);
    doc.text(`Owner Contact: ${room.ownerContactNumber}`, 20, 70);
    doc.text(`Posted On: ${formattedDate}`, 20, 80);
    doc.text(`Room Type: ${room.roomType}`, 20, 90);
    doc.text(`Room City: ${room.roomCity}`, 20, 100);
    doc.text(`Price: Rs ${room.price.toLocaleString()} / month`, 20, 110);
    doc.text(`Room Address: ${room.roomAddress}`, 20, 120);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Tenant Details", margin + detailsWidth2 + 20, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Tenant ID: ${room.buyerCustomerId}`, margin + detailsWidth + 5, 60);
    doc.text(`Tenant Name: ${room.buyerName}`, margin + detailsWidth + 5, 70);
    doc.text(`Tenant NIC: ${room.buyerNIC}`, margin + detailsWidth + 5, 80);
    doc.text(`Tenant Contact Number: ${room.buyerContactNumber}`, margin + detailsWidth + 5, 90);
    doc.text(`Rented Date: ${room.buyingDate}`, margin + detailsWidth + 5, 100);
    doc.text(`Rental Period: ${room.buyingDuration} Months`, margin + detailsWidth + 5, 110);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, 130, 190, 130);
    doc.setTextColor(34, 139, 34);
    doc.text("We hope to serve you again!", 20, 135);
    doc.text("Please consider adding a rating for the room.", 20, 140);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("For any issues, please use our built-in ticket system on the Unistay website.", 20, 150);
    doc.text("Hotline: +077 222 3388", 20, 160);
    doc.text("Email: support@unistay.com", 20, 165);
    doc.save(`Room_${room.roomType}_Booking_Receipt.pdf`);
  };

  return (
    <div className="listings-body">

      {/* ── Navbar ── */}
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <div className="LOGO-container">
            <a className="nav-link" href="/"><img src={logo} alt="LOGO" width="130" /></a>
          </div>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
            data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon" style={{ filter: "invert(1)" }}></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><a className="nav-link" href="/dash">Dashboard</a></li>
              <li className="nav-item"><a className="nav-link" href="/AddRoom">Post Add</a></li>
              <li className="nav-item"><a className="nav-link" href="/RoomList">Properties</a></li>
              <li className="nav-item"><a className="nav-link" href="/service-providers">Services</a></li>
              <li className="nav-item"><a className="nav-link" href="/Userroom">About Us</a></li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="profileDropdown" role="button"
                  data-bs-toggle="dropdown" aria-expanded="false">Account</a>
                <ul className="dropdown-menu" aria-labelledby="profileDropdown">
                  <li><a className="dropdown-item" href="/profile">View Profile</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="/MyRoom">My Room</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="/MyListings">My Listings</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="/register-service-provider">Service Provider</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="/saved-providers">Bookmarks</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  {sessionStorage.getItem("token") && (
                    <li><button className="dropdown-item" onClick={handleLogout}><strong>Logout</strong></button></li>
                  )}
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* ── Header ── */}
      <div className="listings-header">
        <h2>My Listings</h2>
        <p className="subtitle">Manage and review your posted properties</p>
      </div>

      {/* ── Alert ── */}
      {message && (
        <div className="listings-alert">
          <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
            {message}
            <button type="button" className="btn-close" onClick={() => setMessage("")} />
          </div>
        </div>
      )}

      {/* ── Cards ── */}
      <div className="listings-container">
        {rooms.length > 0 ? (
          rooms.map((room) => {
            const activeIdx = getActiveIndex(room._id);
            return (
              <div key={room._id} className="room-card-new">

                {/* ── LEFT: Image Column ── */}
                <div className="room-image-col">
                  <div className="room-image-section">
                    <img
                      src={`http://localhost:8070${room.images[activeIdx]}`}
                      alt={`Room view ${activeIdx + 1}`}
                      className="main-img"
                    />
                    {/* Verification badge */}
                    <span className={`badge-status ${room.isVerified ? "verified" : "unverified"}`}>
                      {room.isVerified ? "✓ Verified" : "Pending"}
                    </span>
                    {/* Booked badge */}
                    {room.isBooked && (
                      <span className="badge-booked-overlay">Booked</span>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {room.images.length > 1 && (
                    <div className="room-thumbnails">
                      {room.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={`http://localhost:8070${img}`}
                          alt={`Thumb ${idx + 1}`}
                          className={`room-thumb ${idx === activeIdx ? "active" : ""}`}
                          onClick={() => handleThumbnailClick(room._id, idx)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* ── RIGHT: Details Column ── */}
                <div className="room-details-col">

                  {/* Title + Price */}
                  <div className="room-card-top">
                    <div className="room-title-block">
                      <h3>{room.roomType}</h3>
                      <div className="room-location">
                        <MapPin size={12} />
                        {room.roomAddress}, {room.roomCity}
                      </div>
                    </div>
                    <div className="room-price-block">
                      <div className="price">Rs {room.price.toLocaleString()}</div>
                      <div className="per-month">per month</div>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="room-meta">
                    <span className="room-meta-item">
                      <Calendar size={12} />
                      {new Date(room.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                    <span className="room-meta-item">
                      <Tag size={12} />
                      {room.roomCity}
                    </span>
                    <span className="room-meta-item">
                      <Home size={12} />
                      {room.roomType}
                    </span>
                  </div>

                  {/* Description */}
                  {room.description && (
                    <p className="room-description">{room.description}</p>
                  )}

                  <hr className="room-card-divider" />

                  {/* Status Pills */}
                  <div className="room-status-row">
                    <span className={`status-pill ${room.isVerified ? "s-verified" : "s-unverified"}`}>
                      {room.isVerified ? "Verified" : "Unverified — Staff will contact you"}
                    </span>
                    <span className={`status-pill ${room.isBooked ? "s-booked" : "s-not-booked"}`}>
                      {room.isBooked ? "Booked" : "Not Booked"}
                    </span>
                    {room.isBookedconfirm && (
                      <span className="status-pill s-confirmed">Booking Confirmed</span>
                    )}
                  </div>

                  {/* Ratings */}
                  {room.ratingHistory && room.ratingHistory.length > 0 && (
                    <div className="rating-section">
                      <h5>Rating History</h5>
                      {room.ratingHistory.map((rating, index) => (
                        <div key={index} className="rating-entry">
                          <div className="buyer-name">{rating.buyerName}</div>
                          <div className="stars-row">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span key={i} className={`star ${i < rating.rating ? "filled" : "empty"}`}>★</span>
                            ))}
                          </div>
                          {rating.description && <p className="rating-desc">{rating.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Spacer pushes buttons to bottom */}
                  <div className="room-spacer" />

                  {/* ── Action Buttons ── */}
                  <div className="room-actions">
                    <button className="btn-action btn-edit" onClick={() => handleRoomUpdate(room)}
                      disabled={room.isVerified} title="Edit Room">
                      <Pencil size={13} /> Edit
                    </button>

                    <button className="btn-action btn-delete" onClick={() => deleteRoom(room._id)} title="Delete">
                      <Trash2 size={13} /> Delete
                    </button>

                    <button className="btn-action btn-repost" onClick={() => handleRepostRoom(room._id)}
                      disabled={!room.isBooked} title="Repost">
                      <RefreshCcw size={13} /> Repost
                    </button>

                    {room.isBooked && (
                      <>
                        <button className="btn-action btn-view" onClick={() => handleViewBuyerInfo(room)} title="Buyer Info">
                          <Eye size={13} /> Buyer Info
                        </button>

                        <button className="btn-action btn-confirm" onClick={() => handlebVerification(room._id)}
                          disabled={room.isBookedconfirm}>
                          <CheckCircle size={13} />
                          {room.isBookedconfirm ? "Confirmed" : "Confirm Booking"}
                        </button>

                        <button className="btn-action btn-message"
                          onClick={() => handleGoToMessaging(room._id, room.buyerName)}>
                          <MessageSquare size={13} /> Messages
                          {room.chatHistory && room.chatHistory.length > 0 && (
                            <span className="badge-dot">!</span>
                          )}
                        </button>
                      </>
                    )}

                    {room.isBookedconfirm && (
                      <button className="btn-action btn-download" onClick={() => generatePDF(room)}
                        title="Download Receipt">
                        <Download size={13} /> Download Receipt
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <Home size={56} color="var(--border)" />
            <h4>No listings yet</h4>
            <p>Once you post a room, it will appear here.</p>
          </div>
        )}
      </div>

      {/* ── Buyer Info Modal ── */}
      <div className="modal fade" id="buyerInfoModal" tabIndex="-1" aria-labelledby="buyerInfoModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="buyerInfoModalLabel">Buyer Information</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {selectedBuyer ? (
                <div>
                  <p><strong>Name:</strong> {selectedBuyer.buyerName}</p>
                  <p><strong>Contact:</strong> {selectedBuyer.buyerContactNumber}</p>
                  <p><strong>NIC:</strong> {selectedBuyer.buyerNIC}</p>
                  <p><strong>Duration:</strong> {selectedBuyer.buyingDuration} months</p>
                  <p><strong>Booking Date:</strong> {new Date(selectedBuyer.buyingDate).toLocaleDateString()}</p>
                </div>
              ) : (
                <p>Loading buyer info...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Room Update Modal ── */}
      <div className="modal fade" id="roomUpdateModal" tabIndex="-1" aria-labelledby="roomUpdateModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="roomUpdateModalLabel">Update Room</h5>
            </div>
            <div className="modal-body">
              <form onSubmit={handleRoomFormSubmit}>
                <div className="mb-3">
                  <label className="form-label">Room Type</label>
                  <input type="text" className="form-control" value={updatedRoomData.roomType}
                    onChange={(e) => setUpdatedRoomData({ ...updatedRoomData, roomType: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Room Address</label>
                  <input type="text" className="form-control" value={updatedRoomData.roomAddress}
                    onChange={(e) => setUpdatedRoomData({ ...updatedRoomData, roomAddress: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Room City</label>
                  <input type="text" className="form-control" value={updatedRoomData.roomCity}
                    onChange={(e) => setUpdatedRoomData({ ...updatedRoomData, roomCity: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Price</label>
                  <input type="text" className="form-control" value={updatedRoomData.price}
                    onChange={(e) => setUpdatedRoomData({ ...updatedRoomData, price: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={3} value={updatedRoomData.description}
                    onChange={(e) => setUpdatedRoomData({ ...updatedRoomData, description: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Room Images</label>
                  <input type="file" className="form-control" multiple onChange={handleImageChange} />
                  <div className="image-previews">
                    {updatedRoomData.images.map((image, index) => (
                      <div key={index} className="image-preview">
                        <img src={`http://localhost:8070${image}`} alt={`Room ${index + 1}`}
                          style={{ width: "100px", height: "100px", objectFit: "cover" }} />
                        <button type="button" className="btn btn-sm btn-danger"
                          onClick={() => handleImageDelete(index, true)}>×</button>
                      </div>
                    ))}
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="image-preview">
                        <img src={preview.url} alt={`Preview ${index + 1}`}
                          style={{ width: "100px", height: "100px", objectFit: "cover" }} />
                        <button type="button" className="btn btn-sm btn-danger"
                          onClick={() => handleImageDelete(index, false)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100">Update Room</button>
              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default LoggedCustomer;
