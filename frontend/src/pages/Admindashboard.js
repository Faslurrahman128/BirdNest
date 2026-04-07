import ramadanMoon from '../assets/ramadan-moon.jpg';
import ramadanLantern from '../assets/ramadan-lantern.jpg';
import christmasBg from '../assets/christmas-bg.jpg';
import tree from '../assets/tree.avif';
import fireworks from '../assets/fireworks.png';
import fireworkIcon from '../assets/firework-icon.png';
import React, { useEffect, useState } from "react";
import { ThemeProvider, useTheme, THEMES } from "../ThemeContext";
import ThemeSwitcher from "../Componets/ThemeSwitcher";
import "../Componets/CSS/theme-decorations.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import AppHeader from "../Componets/AppHeader";
import "../Componets/CSS/admin-glass.css";
import logo from "../Componets/assets/APPLOGO.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function AdminDashboardContent() {
    // Handle rejection of a room (must be inside component)
    const handleRejection = async (id) => {
      try {
        setLoading(true);
        await axios.put(
          `http://localhost:8070/Room/verify/${id}`,
          { isVerified: false, rejected: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Refetch rooms to ensure state is correct
        await fetchRooms();
        setSelectedRoom(null);
        setError("");
        setLoading(false);
      } catch (err) {
        setError("Failed to reject room.");
        setLoading(false);
      }
    };
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

  // Room fetch logic extracted for reuse
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8070/rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const roomsData = response.data;

      // Only show rooms with rejected:true under verifiedRooms, not under unverifiedRooms
      let verified = roomsData.filter((room) => room.isVerified && !room.rejected);
      const rejected = roomsData.filter((room) => room.rejected === true);
      let unverified = roomsData.filter((room) => room.isVerified === false && !room.rejected);

      // Sort verified rooms by verifiedAt (desc), fallback to createdAt if missing
      verified = verified.sort((a, b) => {
        const aDate = a.verifiedAt ? new Date(a.verifiedAt) : new Date(a.createdAt);
        const bDate = b.verifiedAt ? new Date(b.verifiedAt) : new Date(b.createdAt);
        return bDate - aDate;
      });

      // Sort unverified rooms by createdAt (desc)
      unverified = unverified.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setVerifiedRooms([...verified, ...rejected]);
      // Debug log to check verifiedAt values
      console.log('Verified Rooms:', verified.map(r => ({ id: r._id, verifiedAt: r.verifiedAt, createdAt: r.createdAt })));
      setUnverifiedRooms(unverified);
      setLoading(false);
    } catch (error) {
      setError("Error fetching rooms. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line
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
      setLoading(true);
      await axios.put(
        `http://localhost:8070/Room/verify/${id}`,
        { isVerified: true, rejected: false },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchRooms();
      setSelectedRoom(null);
      setError("");
      setLoading(false);
      alert("Room successfully verified!");
    } catch (err) {
      setError("Failed to verify room.");
      setLoading(false);
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
  


  // PDF generation states
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  // Add missing PDF date range states
  const [pdfStartDate, setPdfStartDate] = useState("");
  const [pdfEndDate, setPdfEndDate] = useState("");

  const openPdfModal = () => {
    setShowPdfModal(true);
  };
  const closePdfModal = () => setShowPdfModal(false);
  const submitPdfModal = () => {
    setPdfStartDate(tempStartDate);
    setPdfEndDate(tempEndDate);
    setShowPdfModal(false);
    setTimeout(() => handleGeneratePdf(), 0);
  };

  // Helper: filter rooms by date range
  const filterRoomsByDate = (rooms, start, end) => {
    if (!start && !end) return rooms;
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    return rooms.filter(room => {
      const created = new Date(room.createdAt);
      if (startDate && created < startDate) return false;
      if (endDate && created > endDate) return false;
      return true;
    });
  };

  // PDF generation handler
  const handleGeneratePdf = () => {
    // Filter and sort by submission date (createdAt) descending
    let filteredVerified = filterRoomsByDate(verifiedRooms, pdfStartDate, pdfEndDate);
    let filteredUnverified = filterRoomsByDate(unverifiedRooms, pdfStartDate, pdfEndDate);
    filteredVerified = filteredVerified.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    filteredUnverified = filteredUnverified.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Room Summary Report", 14, 16);
    doc.setFontSize(11);
    doc.text(`Date Range: ${pdfStartDate || 'All'} to ${pdfEndDate || 'All'}`, 14, 24);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    // Verified Table
    doc.setFontSize(13);
    doc.text("Verified Rooms", 14, 40);
    autoTable(doc, {
      startY: 44,
      head: [["Type", "Owner", "City", "Price", "Submission Date", "Approval Date"]],
      body: filteredVerified.map(r => [
        r.roomType,
        r.ownerName || "N/A",
        r.roomCity,
        r.price,
        r.createdAt ? new Date(r.createdAt).toLocaleString() : "-",
        r.verifiedAt ? new Date(r.verifiedAt).toLocaleString() : "-"
      ]),
      theme: 'grid',
      headStyles: { fillColor: [40, 167, 69] },
    });
    let nextY = doc.lastAutoTable.finalY + 10;
    // Unverified Table
    doc.setFontSize(13);
    doc.text("Unverified Rooms", 14, nextY);
    autoTable(doc, {
      startY: nextY + 4,
      head: [["Type", "Owner", "City", "Price", "Submission Date", "Approval Date (Status)"]],
      body: filteredUnverified.map(r => [
        r.roomType,
        r.ownerName || "N/A",
        r.roomCity,
        r.price,
        r.createdAt ? new Date(r.createdAt).toLocaleString() : "-",
        r.verifiedAt ? new Date(r.verifiedAt).toLocaleString() : "-"
      ]),
      theme: 'grid',
      headStyles: { fillColor: [255, 193, 7] },
    });
    doc.save(`Room_Summary_${pdfStartDate || 'All'}_${pdfEndDate || 'All'}.pdf`);
  };

  const { theme } = useTheme();
  // Theme background and doodle icon
  let bgImage = null;
  let doodle = null;
  if (theme === THEMES.RAMADAN) {
    bgImage = ramadanMoon;
    doodle = <img src={ramadanLantern} alt="Ramadan" className="ramadan-icon" />;
  } else if (theme === THEMES.CHRISTMAS) {
    bgImage = christmasBg;
    doodle = <img src={tree} alt="Christmas" className="christmas-icon" />;
  } else if (theme === THEMES.NEWYEAR) {
    bgImage = fireworks;
    doodle = <img src={fireworkIcon} alt="New Year" className="newyear-icon" />;
  }

  return (
    <div
      className={`admin-glass-bg theme-${theme}`}
      style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'top right' } : {}}
    >
      {/* Animated SVG Background Shapes */}
      <svg className="admin-bg-svg" width="100%" height="100%" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="wave1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b7cbe6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#e0e7ef" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="wave2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4b79a1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1a237e" stopOpacity="0.10" />
          </linearGradient>
        </defs>
        <path d="M0,700 Q360,800 720,700 T1440,700 V900 H0 Z" fill="url(#wave1)">
          <animate attributeName="d" dur="8s" repeatCount="indefinite" values="M0,700 Q360,800 720,700 T1440,700 V900 H0 Z;M0,720 Q360,780 720,720 T1440,720 V900 H0 Z;M0,700 Q360,800 720,700 T1440,700 V900 H0 Z" />
        </path>
        <path d="M0,800 Q480,900 960,800 T1440,800 V900 H0 Z" fill="url(#wave2)">
          <animate attributeName="d" dur="10s" repeatCount="indefinite" values="M0,800 Q480,900 960,800 T1440,800 V900 H0 Z;M0,820 Q480,880 960,820 T1440,820 V900 H0 Z;M0,800 Q480,900 960,800 T1440,800 V900 H0 Z" />
        </path>
      </svg>
      {/* App Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
        <AppHeader appName="Bird Nest" tagline="Empowering Admins, Effortlessly" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeSwitcher />
          {doodle}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "80vh", gap: "2rem", position: "relative", zIndex: 2 }}>
        {/* Sidebar Navigation */}
        <div style={{ minWidth: 220, maxWidth: 260, marginTop: "2.5rem" }}>
          <div className="admin-glass-card" style={{ padding: "1.5rem 1rem", minWidth: 0, maxWidth: 260 }}>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <img src={logo} alt="Bird Nest LOGO" style={{ width: 60, borderRadius: 12, marginBottom: 8, background: "#fff" }} />
            </div>
            <button className={`admin-glass-input${activeSection === "room" ? " active" : ""}`} style={{ marginBottom: 10, width: "100%", minWidth: 0, display: "block" }} onClick={() => handleSectionClick("room")}>Room Management</button>
            <button className={`admin-glass-input${activeSection === "staff" ? " active" : ""}`} style={{ marginBottom: 10, width: "100%", minWidth: 0, display: "block" }} onClick={() => handleSectionClick("staff")}>Staff Management</button>
            <button className={`admin-glass-input${activeSection === "admin" ? " active" : ""}`} style={{ marginBottom: 10, width: "100%", minWidth: 0, display: "block" }} onClick={() => handleSectionClick("admin")}>Staff Registration</button>
            {sessionStorage.getItem("token") && (
              <button className="admin-glass-input" style={{ background: "#e74c3c", color: "#fff", marginTop: 18, width: "100%", minWidth: 0, display: "block" }} onClick={handleLogout}><strong>Logout</strong></button>
            )}
          </div>
        </div>
        {/* Main Content */}
        <div className="admin-glass-center" style={{ alignItems: "flex-start", width: "100%", marginTop: "2.5rem" }}>
          <div className="admin-glass-card" style={{ width: "100%", maxWidth: 900, minWidth: 320, margin: 0 }}>
            {message1 && <div className="alert alert-danger">{message1}</div>}
            {/* Room Management Section */}
            {activeSection === "room" && (
              <section id="room-management" className="mb-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                  <h2 className="admin-glass-title" style={{ marginBottom: 0 }}>Room Management</h2>
                  <button
                    onClick={openPdfModal}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      background: 'linear-gradient(90deg, #1976d2 60%, #2196f3 100%)',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '1rem',
                      padding: '7px 18px',
                      border: 'none',
                      borderRadius: 8,
                      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                      marginLeft: 12,
                      marginTop: 2,
                      minWidth: 0,
                      cursor: 'pointer',
                      transition: 'background 0.2s, box-shadow 0.2s',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = 'linear-gradient(90deg, #1565c0 60%, #1976d2 100%)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(25, 118, 210, 0.18)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = 'linear-gradient(90deg, #1976d2 60%, #2196f3 100%)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.10)';
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6zm0 2h12v16H6V4zm6 2a1 1 0 0 1 1 1v5.586l1.293-1.293a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414L11 12.586V7a1 1 0 0 1 1-1z"/></svg>
                    PDF Summary
                  </button>
                </div>
                {unverifiedRooms.length > 0 && (
                  <div className="alert alert-warning text-center" style={{ marginTop: 12 }}>
                    ⚠️ There are {unverifiedRooms.length} unverified rooms waiting for approval.
                  </div>
                )}

                {/* PDF Modal */}
                {showPdfModal && (
                  <div style={{
                    position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.22)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{
                      background: '#fff',
                      borderRadius: 18,
                      padding: '38px 38px 28px 38px',
                      minWidth: 340,
                      maxWidth: 420,
                      boxShadow: '0 8px 40px rgba(25, 118, 210, 0.18)',
                      border: '1.5px solid #e3eafc',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}>
                      <h3 style={{
                        marginBottom: 22,
                        fontWeight: 700,
                        fontSize: 24,
                        color: '#232946',
                        letterSpacing: 0.2
                      }}>Select Duration for PDF</h3>
                      <div style={{
                        display: 'flex',
                        gap: 28,
                        marginBottom: 18,
                        width: '100%',
                        justifyContent: 'center',
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <label style={{ fontWeight: 500, color: '#3b4252', marginBottom: 6 }}>Start Date</label>
                          <input
                            type="date"
                            value={tempStartDate}
                            onChange={e => setTempStartDate(e.target.value)}
                            style={{
                              padding: '7px 10px',
                              borderRadius: 6,
                              border: '1.5px solid #bfcbe6',
                              fontSize: 15,
                              minWidth: 120,
                              outline: 'none',
                              transition: 'border 0.2s',
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <label style={{ fontWeight: 500, color: '#3b4252', marginBottom: 6 }}>End Date</label>
                          <input
                            type="date"
                            value={tempEndDate}
                            onChange={e => setTempEndDate(e.target.value)}
                            style={{
                              padding: '7px 10px',
                              borderRadius: 6,
                              border: '1.5px solid #bfcbe6',
                              fontSize: 15,
                              minWidth: 120,
                              outline: 'none',
                              transition: 'border 0.2s',
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ width: '100%', height: 1, background: '#e3eafc', margin: '10px 0 22px 0' }} />
                      <div style={{ display: 'flex', gap: 22, justifyContent: 'center', width: '100%' }}>
                        <button
                          onClick={closePdfModal}
                          style={{
                            background: '#7b8794',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 17,
                            border: 'none',
                            borderRadius: 8,
                            padding: '12px 38px',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            boxShadow: '0 2px 8px rgba(123,135,148,0.10)'
                          }}
                          onMouseOver={e => e.currentTarget.style.background = '#616e7c'}
                          onMouseOut={e => e.currentTarget.style.background = '#7b8794'}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={submitPdfModal}
                          disabled={!tempStartDate && !tempEndDate}
                          style={{
                            background: (!tempStartDate && !tempEndDate) ? '#a7d7c5' : '#159a6f',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 17,
                            border: 'none',
                            borderRadius: 8,
                            padding: '12px 38px',
                            cursor: (!tempStartDate && !tempEndDate) ? 'not-allowed' : 'pointer',
                            opacity: (!tempStartDate && !tempEndDate) ? 0.7 : 1,
                            boxShadow: '0 2px 8px rgba(21,154,111,0.10)'
                          }}
                          onMouseOver={e => {
                            if (!e.currentTarget.disabled) e.currentTarget.style.background = '#107457';
                          }}
                          onMouseOut={e => {
                            if (!e.currentTarget.disabled) e.currentTarget.style.background = '#159a6f';
                          }}
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Unverified Rooms */}
                <h4 className="admin-glass-subtitle">Unverified Rooms</h4>
                {error && <div className="text-danger" style={{textAlign: 'center', marginBottom: 10}}>{error}</div>}
                {loading ? (
                  <p>Loading rooms...</p>
                ) : unverifiedRooms.length === 0 ? (
                  <p>No unverified rooms available.</p>
                ) : (
                  <div className="admin-glass-card" style={{ background: 'rgba(255,255,255,0.35)', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)', borderRadius: '22px', border: '1.5px solid rgba(255,255,255,0.35)', padding: '1.2rem 1.2rem 1rem 1.2rem', margin: '1.2rem 0', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto', position: 'relative', zIndex: 2 }}>
                    <table className="table table-striped" style={{ background: 'transparent', margin: 0 }}>
                      <thead>
                        <tr>
                          <th>Room Type</th>
                          <th>Address</th>
                          <th>Price</th>
                          <th>Submission Date</th>
                          <th>Approval Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...unverifiedRooms].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((room) => (
                          <React.Fragment key={room._id}>
                            <tr onClick={() => handleRoomClick(room)} style={{ cursor: "pointer" }}>
                              <td>{room.roomType} - {room.ownerName || "N/A"}</td>
                              <td>{room.roomAddress}</td>
                              <td>Rs {room.price.toLocaleString()}</td>
                              <td>{room.createdAt ? new Date(room.createdAt).toLocaleString() : "-"}</td>
                              <td>{room.verifiedAt ? new Date(room.verifiedAt).toLocaleString() : "-"}</td>
                            </tr>
                            {selectedRoom?._id === room._id && (
                              <tr>
                                <td colSpan="5">
                                  <div className="accordion-body admin-glass-card" style={{ margin: '20px 0', background: 'rgba(255,255,255,0.45)', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)', borderRadius: '22px', border: '1.5px solid rgba(255,255,255,0.35)', padding: '2rem 2rem 1.5rem 2rem', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
                                      <div style={{ flex: '1 1 260px', minWidth: 220 }}>
                                        <img
                                          src={`http://localhost:8070${room.images[activeImageIndex]}`}
                                          alt={`Room ${activeImageIndex + 1}`}
                                          className="d-block w-100"
                                          style={{
                                            maxWidth: "320px",
                                            maxHeight: "180px",
                                            margin: "auto",
                                            borderRadius: "14px",
                                            boxShadow: "0 2px 12px rgba(31,38,135,0.10)",
                                            objectFit: "cover"
                                          }}
                                        />
                                        <div className="row mt-2 justify-content-center" style={{ gap: 6 }}>
                                          {room.images.map((image, index) => (
                                            <div key={index} className="col-1">
                                              <img
                                                src={`http://localhost:8070${image}`}
                                                alt={`Thumbnail ${index + 1}`}
                                                className={`img-thumbnail${activeImageIndex === index ? ' border-primary' : ''}`}
                                                style={{ cursor: 'pointer', borderRadius: 6, border: activeImageIndex === index ? '2px solid #4b79a1' : '1px solid #ccc', width: 38, height: 38, objectFit: 'cover' }}
                                                onClick={() => handleThumbnailClick(index)}
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      <div style={{ flex: '2 1 320px', minWidth: 220 }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 32px', marginBottom: 10 }}>
                                          <div style={{ flex: '1 1 180px', minWidth: 140 }}>
                                            <span role="img" aria-label="user">👤</span> <strong>Owner:</strong> {room.ownerName || "N/A"}
                                          </div>
                                          <div style={{ flex: '1 1 180px', minWidth: 140 }}>
                                            <span role="img" aria-label="phone">📞</span> <strong>Contact:</strong> {room.ownerContactNumber || "N/A"}
                                          </div>
                                          <div style={{ flex: '1 1 180px', minWidth: 140 }}>
                                            <span role="img" aria-label="calendar">📅</span> <strong>Listed:</strong> {new Date(room.createdAt).toLocaleString()}
                                          </div>
                                          <div style={{ flex: '1 1 180px', minWidth: 140 }}>
                                            <span role="img" aria-label="location">📍</span> <strong>Address:</strong> {room.roomAddress || "N/A"}
                                          </div>
                                          <div style={{ flex: '1 1 180px', minWidth: 140 }}>
                                            <span role="img" aria-label="city">🏙️</span> <strong>City:</strong> {room.roomCity || "N/A"}
                                          </div>
                                          <div style={{ flex: '1 1 180px', minWidth: 140 }}>
                                            <span role="img" aria-label="price">💰</span> <strong>Price:</strong> Rs {room.price?.toLocaleString() || "N/A"}
                                          </div>
                                          <div style={{ flex: '1 1 180px', minWidth: 140 }}>
                                            <span role="img" aria-label="negotiable">🤝</span> <strong>Negotiable:</strong> <span className={room.isNegotiable ? 'badge bg-success' : 'badge bg-secondary'} style={{ fontSize: 13 }}>{room.isNegotiable ? 'Yes' : 'No'}</span>
                                          </div>
                                        </div>
                                        <hr style={{ margin: '10px 0 14px 0', borderTop: '1.5px solid #e0e7ef' }} />
                                        <div style={{ marginBottom: 10 }}>
                                          <strong>Description:</strong>
                                          <div style={{ background: '#f7fafd', borderRadius: 8, padding: '8px 12px', marginTop: 4, fontSize: 15, color: '#232946' }}>{room.description || "N/A"}</div>
                                        </div>
                                        {room.features && room.features.length > 0 && (
                                          <div style={{ marginBottom: 10 }}>
                                            <strong>Features:</strong>
                                            <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none' }}>
                                              {room.features.map((feature, idx) => (
                                                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15 }}>
                                                  <span role="img" aria-label="check">✅</span> {feature}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        <div style={{ marginTop: 18, display: 'flex', gap: '10px' }}>
                                          <button
                                            onClick={() => handleVerification(room._id)}
                                            className="approve-btn btn btn-success"
                                            style={{ fontSize: 15, padding: '6px 14px', borderRadius: 8 }}
                                          >
                                            Approve
                                          </button>
                                          <button
                                            onClick={() => handleRejection(room._id)}
                                            className="reject-btn btn btn-danger"
                                            style={{ fontSize: 15, padding: '6px 14px', borderRadius: 8 }}
                                          >
                                            Reject
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    {/* Rating History Section */}
                                    <div className="mt-4">
                                      <h5 style={{ fontWeight: 600, color: '#4b79a1' }}>
                                        <span role="img" aria-label="star">⭐</span> Rating History
                                      </h5>
                                      {room.ratingHistory && room.ratingHistory.length > 0 ? (
                                        room.ratingHistory.map((rating, index) => (
                                          <div key={index} style={{ marginBottom: 10 }}>
                                            <div>
                                              <strong>Buyer:</strong> {rating.buyerName}
                                              <div>
                                                <strong>Rating:</strong>
                                                {Array.from({ length: 5 }, (_, starIndex) => (
                                                  <span
                                                    key={starIndex}
                                                    style={{
                                                      fontSize: "20px",
                                                      color: starIndex < rating.rating ? "#FFD700" : "#D3D3D3",
                                                      cursor: "pointer",
                                                    }}
                                                  >
                                                    ★
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                            <strong>Description:</strong> {rating.description}
                                            <hr style={{ margin: "10px 0", borderTop: "1px solid #eee" }} />
                                          </div>
                                        ))
                                      ) : (
                                        <p style={{ color: '#888', fontStyle: 'italic' }}>No ratings yet.</p>
                                      )}
                                    </div>
                                  </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                    </table>
                  </div>
                )}
                {/* Verified Rooms */}
                <h4 className="admin-glass-subtitle">Verified Rooms</h4>
                {loading ? (
                  <p>Loading rooms...</p>
                ) : verifiedRooms.length === 0 ? (
                  <p>No verified rooms available.</p>
                ) : (
                  <div className="admin-glass-card" style={{ background: 'rgba(255,255,255,0.35)', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)', borderRadius: '22px', border: '1.5px solid rgba(255,255,255,0.35)', padding: '1.2rem 1.2rem 1rem 1.2rem', margin: '1.2rem 0', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto', position: 'relative', zIndex: 2 }}>
                    <table className="table table-striped" style={{ background: 'transparent', margin: 0 }}>
                      <thead>
                        <tr>
                          <th>Room Type</th>
                          <th>Location</th>
                          <th>Price</th>
                          <th>Submission Date</th>
                          <th>Approval Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...verifiedRooms].sort((a, b) => {
                          const aDate = a.verifiedAt ? new Date(a.verifiedAt) : new Date(a.createdAt);
                          const bDate = b.verifiedAt ? new Date(b.verifiedAt) : new Date(b.createdAt);
                          return bDate - aDate;
                        }).map((room) => (
                          <React.Fragment key={room._id}>
                            <tr onClick={() => handleRoomClick(room)} style={{ cursor: "pointer" }}>
                              <td>{room.roomType} - {room.ownerName || "N/A"}</td>
                              <td>{room.roomCity}</td>
                              <td>Rs {room.price.toLocaleString()}</td>
                              <td>{room.createdAt ? new Date(room.createdAt).toLocaleString() : "-"}</td>
                              <td>{room.verifiedAt ? new Date(room.verifiedAt).toLocaleString() : "-"}</td>
                            </tr>
                            {selectedRoom?._id === room._id && (
                              <tr>
                                <td colSpan="5">
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
                                    <strong>Owner Contact:</strong> {room.ownerContactNumber || "N/A"}
                                  </p>
                                  <p>
                                    <strong>Listed On:</strong> {new Date(room.createdAt).toLocaleString()}
                                  </p>
                                  <p>
                                    <strong>Room Address:</strong> {room.roomAddress || "N/A"}
                                  </p>
                                  <p>
                                    <strong>Negotiable:</strong> {room.isNegotiable ? "Yes" : "No"}
                                  </p>
                                  <p>
                                    <strong>Description:</strong> {room.description || "N/A"}
                                  </p>
                                  <p>
                                    <strong>Submission Date:</strong> {room.createdAt ? new Date(room.createdAt).toLocaleString() : "-"}
                                  </p>
                                  <p>
                                    <strong>Approval Date:</strong> {room.verifiedAt ? new Date(room.verifiedAt).toLocaleString() : "-"}
                                  </p>
                                  {room.rejected ? (
                                    <span className="badge bg-danger" style={{ fontSize: 15, padding: '6px 14px', borderRadius: 8 }}>Rejected ❌</span>
                                  ) : (
                                    <span className="badge bg-success" style={{ fontSize: 15, padding: '6px 14px', borderRadius: 8 }}>Approved ✅</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
            {/* Staff Management Section */}
            {activeSection === "staff" && (
              <section id="staff-management" className="mb-4">
                <h2 className="admin-glass-title">Staff Management</h2>
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
                <h2 className="admin-glass-title">Staff Registration</h2>
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
                <form className="admin-glass-form" onSubmit={handleAdminRegistration} autoComplete="off" style={{ maxWidth: 520, margin: "0 auto" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                    <div className="admin-glass-form-group">
                      <label htmlFor="firstname">First Name <span style={{ color: '#c62828' }}>*</span></label>
                      <input
                        type="text"
                        className="admin-glass-input"
                        id="firstname"
                        placeholder="First name"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        required
                      />
                    </div>
                    <div className="admin-glass-form-group">
                      <label htmlFor="lastname">Last Name (Optional)</label>
                      <input
                        type="text"
                        className="admin-glass-input"
                        id="lastname"
                        placeholder="Last name"
                        onChange={(e) => setLName(e.target.value)}
                        value={lname}
                      />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                    <div className="admin-glass-form-group">
                      <label htmlFor="phonenumber">Phone Number <span style={{ color: '#c62828' }}>*</span></label>
                      <input
                        type="tel"
                        className="admin-glass-input"
                        id="phonenumber"
                        placeholder="Phone number"
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        value={phoneNumber}
                        required
                      />
                    </div>
                    <div className="admin-glass-form-group">
                      <label htmlFor="useremail">Email <span style={{ color: '#c62828' }}>*</span></label>
                      <input
                        type="email"
                        className="admin-glass-input"
                        id="useremail"
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        required
                      />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                    <div className="admin-glass-form-group">
                      <label htmlFor="userpassword">Password <span style={{ color: '#c62828' }}>*</span></label>
                      <input
                        type="password"
                        className="admin-glass-input"
                        id="userpassword"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        required
                      />
                    </div>
                    <div className="admin-glass-form-group">
                      <label htmlFor="confirmPassword">Confirm Password <span style={{ color: '#c62828' }}>*</span></label>
                      <input
                        type="password"
                        className="admin-glass-input"
                        id="confirmPassword"
                        placeholder="Confirm Password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        value={confirmPassword}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="admin-glass-input" style={{ background: "#4b79a1", color: "#fff", fontWeight: 600, fontSize: "1.1rem", marginTop: 10 }}>
                    Register
                  </button>
                </form>
              </section>
            )}
          </div>
        </div>
      </div>
      {/* Copyright Footer */}
      <footer style={{ width: "100%", textAlign: "center", marginTop: "2rem", color: "#4b79a1", fontSize: "0.98rem", opacity: 0.85, zIndex: 2, position: "relative" }}>
        © {new Date().getFullYear()} Bird Nest. All rights reserved.
      </footer>
    </div>
  );
}


// Wrap with ThemeProvider
export default function AdminDashboard() {
  return (
    <ThemeProvider>
      <AdminDashboardContent />
    </ThemeProvider>
  );
}