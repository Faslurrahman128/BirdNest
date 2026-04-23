import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../Componets/CSS/./MyListings.css";
import "../Componets/CSS/AddRoom.css";
import {
  Pencil, Trash2, Eye, RefreshCcw, Download,
  MapPin, Calendar, Tag, MessageSquare, CheckCircle, Home,
} from "lucide-react";
import jsPDF from "jspdf";
import AppHeader from "../Componets/AppHeader";

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

  const navLinks = [
    { label: "🏠 Dashboard", href: "/dash" },
    { label: "📋 Post Add", href: "/AddRoom" },
    { label: "🏘️ Properties", href: "/RoomList" },
    { label: "🔧 Services", href: "/service-providers" },
    { label: "ℹ️ About Us", href: "/AboutUs" },
  ];

  const accountLinks = [
    { label: "👤 View Profile", href: "/profile" },
    { label: "🛏️ My Room", href: "/MyRoom" },
    { label: "📋 My Listings", href: "/MyListings", active: true },
    { label: "🎟️ Add a Ticket", href: "/Ticket" },
    { label: "🔑 Service Provider", href: "/register-service-provider" },
    { label: "🔖 Bookmarks", href: "/saved-providers" },
  ];

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
      <AppHeader
        appName="Bird Nest"
        tagline="Find Your Perfect Space"
        showLogout={!!sessionStorage.getItem("token")}
        onLogout={handleLogout}
      />

      <div className="addroom-layout">
        <aside className="addroom-sidebar">
          <p className="sidebar-section-label">Navigation</p>
          <nav className="sidebar-nav">
            {navLinks.map(({ label, href }) => (
              <Link key={href} to={href} className="sidebar-link">
                {label}
              </Link>
            ))}
          </nav>

          <p className="sidebar-section-label" style={{ marginTop: "28px" }}>Account</p>
          <nav className="sidebar-nav">
            {accountLinks.map(({ label, href, active }) => (
              <Link
                key={href}
                to={href}
                className={`sidebar-link${active ? " sidebar-link--active" : ""}`}
              >
                {label}
              </Link>
            ))}
            {sessionStorage.getItem("token") && (
              <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
                🚪 Logout
              </button>
            )}
          </nav>
        </aside>

        <div className="Postadd-container-body" style={{ flex: 1, minWidth: 0 }}>
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
                        <span className={`badge-status ${room.isVerified ? "verified" : "unverified"}`}>
                          {room.isVerified ? "✓ Verified" : "Pending"}
                        </span>
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

                    {/* ── RIGHT: Details Column (Sanduni's Version) ── */}
                    <div className="room-details-col-sanduni">
                      <h3><strong>{room.roomType}</strong> - {room.roomCity}</h3>
                      <p><strong>Posted On</strong> - {new Date(room.createdAt).toLocaleString()}</p>
                      <p className="room-price"><strong>Price</strong> Rs {room.price.toLocaleString()} / month</p>
                      <p><strong>Description </strong>{room.description}</p>
                      <p><strong>Address </strong>{room.roomAddress}</p>
                      
                      <p>
                        <strong>Verification:</strong>{" "}
                        {room.isVerified ? (
                          <>
                            <span className="badge bg-success">Verified</span>
                            <span className="ms-2">Your room is listed.</span>
                          </>
                        ) : (
                          <>
                            <span className="badge bg-warning text-dark">Unverified</span>
                            <span className="ms-2">Staff member will contact you to verify.</span>
                          </>
                        )}
                      </p>
                      <p>
                        <strong>Booking:</strong>{" "}
                        {room.isBooked ? (
                          <span className="badge bg-success">Booked</span>
                        ) : (
                          <span className="badge bg-warning text-dark">Not Yet</span>
                        )}
                      </p>

                      <div className="d-flex justify-content-start mt-2">
                        <button 
                          className="btn me-1" 
                          onClick={() => handleRoomUpdate(room)}
                          title="Edit Room"
                          disabled={room.isVerified}
                        >
                          <Pencil size={20} /> Edit
                        </button>

                        <button 
                          className="btn" 
                          onClick={() => deleteRoom(room._id)}
                          title="Delete Room"
                        >
                          <Trash2 size={20} /> Delete Room
                        </button>

                        <button className="btn" onClick={() => handleRepostRoom(room._id)}
                          disabled={!room.isBooked}
                        >
                          <RefreshCcw size={20} /> Repost
                        </button>

                        {room.isBooked && (
                          <>
                            <button 
                              className="btn btn-info" 
                              onClick={() => handleViewBuyerInfo(room)}
                              title="View Buyer Info"
                            >
                              <Eye size={20} /> 
                            </button>

                            <button
                              onClick={() => handlebVerification(room._id)}
                              className="btn btn-success"
                              disabled={room.isBookedconfirm}
                            >
                              {room.isBookedconfirm ? "Booking Confirmed" : "Confirm Booking"}
                            </button>

                            <button
                              className="btn btn-info mt-3 position-relative"
                              onClick={() => handleGoToMessaging(room._id, room.buyerName)}
                            >
                              Messages
                              {room.chatHistory && room.chatHistory.length > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                  !
                                </span>
                              )}
                            </button>
                          </>
                        )}
                      </div>

                      {/* New PDF download button */}
                      {room.isBookedconfirm && (
                        <div className="mt-3 mb-3">
                          <h6 className="dowloadtext mb-2">Download the Rental Confirmation from here</h6>
                          <button 
                            className="btn btn-primary" 
                            onClick={() => generatePDF(room)} 
                            title="Download Rental Confirmation PDF"
                          >
                            <Download size={20} className="me-2" /> Download Confirmation
                          </button>
                        </div>
                      )}
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
        </div>
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