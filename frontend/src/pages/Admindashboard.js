import React, { useEffect, useState } from "react";
import { ThemeProvider, useTheme, THEMES } from "../ThemeContext";
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
  const [allStaff, setAllStaff] = useState([]);
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

  // Staff registration state
  const [role, setRole] = useState("");

  // Staff selection state for bulk actions
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);

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

  // Staff fetch logic
  const fetchStaff = async () => {
    try {
      console.log("Fetching staff data...");
      const response = await axios.get("http://localhost:8070/employee/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Staff data received:", response.data);
      setAllStaff(response.data);
    } catch (err) {
      console.error("Error fetching staff:", err);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchStaff();
    // eslint-disable-next-line
  }, [token]);

  // Aggregate stats for the professional dashboard cards
  const summaryStats = {
    totalRooms: verifiedRooms.length + unverifiedRooms.length,
    pendingVerifications: unverifiedRooms.length,
    verifiedListings: verifiedRooms.filter(r => !r.rejected).length,
    rejectedListings: verifiedRooms.filter(r => r.rejected).length,
    staffCount: allStaff.length,
  };

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

  // Staff Registration Handler
  const handleStaffRegistration = async (e) => {
    e.preventDefault();
    if (!name || !phoneNumber || !email || !password || !role) {
      setRegistrationMessage("Please fill out all required fields (First Name, Phone Number, Email, Password, Role).");
      return;
    }
    if (password !== confirmPassword) {
      setRegistrationMessage("Passwords do not match. Please try again.");
      return;
    }
    if (password.length < 8) {
      setRegistrationMessage("Security Requirement: Password must be at least 8 characters long.");
      return;
    }
    const newStaff = {
      name,
      Lname: lname,
      Phonenumber: phoneNumber,
      email,
      password,
      role,
      createdAt,
    };
    try {
      const response = await axios.post("http://localhost:8070/employee/register", newStaff, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchStaff(); // Refresh the counts immediately after success
      
      const responseData = response.data;
      
      // Store current reg info for potential retry
      setLastRegisteredStaff({ 
        id: responseData.id || "new", 
        email, 
        name,
        emailSent: responseData.emailSent,
        info: responseData.info
      }); 
      setLastRegPassword(password); // Store plain text temp pass for the success card retry button
      setRegFlowState('success'); // Switch to success view

      // Clear the form fields for next use
      setName("");
      setLName("");
      setPhoneNumber("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("");
      setCreatedAt("");
      setRegistrationMessage("");
    } catch (err) {
      setRegistrationMessage(
        err.response ? err.response.data.error : "An error occurred during staff registration."
      );
    }
  };

  const [lastRegisteredStaff, setLastRegisteredStaff] = useState(null);
  const [regFlowState, setRegFlowState] = useState('form'); // 'form' or 'success'
  const [lastRegPassword, setLastRegPassword] = useState(''); // Temp store for retry functionality 

  // Toggle Staff Status Handler
  const handleToggleStaffStatus = async (staffId, currentStatus) => {
    try {
      await axios.put(`http://localhost:8070/employee/status/${staffId}`, {
        isActive: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh the staff list to reflect changes
      fetchStaff();
    } catch (err) {
      console.error("Error toggling staff status:", err);
      setError("Failed to update staff status.");
    }
  };

  // Selection handlers for bulk delete
  const handleSelectStaff = (id, role) => {
    if (role === 'Admin') return; // Cannot select admins
    setSelectedStaffIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAllStaff = () => {
    const deletableStaff = allStaff.filter(s => s.role !== 'Admin');
    if (selectedStaffIds.length === deletableStaff.length) {
      setSelectedStaffIds([]); // Deselect all
    } else {
      setSelectedStaffIds(deletableStaff.map(s => s._id)); // Select all non-admins
    }
  };

  const handleSingleDeleteStaff = async (staffId, staffName) => {
    const confirmMessage = `Are you sure you want to permanently delete ${staffName}? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await axios.delete(`http://localhost:8070/employee/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`${staffName} has been successfully deleted.`);
      fetchStaff();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.error || "Deletion failed.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStaffIds.length === 0) return;

    const confirmMessage = `Are you sure you want to permanently delete ${selectedStaffIds.length} selected staff profiles? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await axios.post("http://localhost:8070/employee/bulk-delete", {
        ids: selectedStaffIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Successfully deleted ${selectedStaffIds.length} profiles.`);
      setSelectedStaffIds([]); // Clear selection
      fetchStaff(); // Refresh list
    } catch (err) {
      console.error("Bulk delete error:", err);
      alert(err.response?.data?.error || "Bulk deletion failed.");
    }
  };

  // Resend Credentials Handler
  const handleResendCredentials = async (staffId, staffName) => {
    const tempPassword = window.prompt(`Enter a temporary password to resend to ${staffName}:`);
    if (!tempPassword) return;

    try {
      setLoading(true);
      await axios.post("http://localhost:8070/employee/send-credentials", {
        staffId,
        password: tempPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Credentials successfully resent to ${staffName}.`);
      setLoading(false);
    } catch (err) {
      console.error("Resend error:", err);
      alert(err.response?.data?.error || "Failed to resend email.");
      setLoading(false);
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

  const { theme, selectTheme } = useTheme();
  const [themeMessage, setThemeMessage] = useState("");

  // Show message when theme changes
  useEffect(() => {
    if (!theme) return;
    let msg = "";
    if (theme === THEMES.PONGAL) {
      msg = "🌾 Thai Pongal\n\nThai Pongal seasonal theme has been successfully activated and the system is now running in this theme.";
    } else if (theme === THEMES.RAMADAN) {
      msg = "🌙 Ramadan\n\nRamadan seasonal theme has been successfully activated and the system is now running in this theme.";
    } else if (theme === THEMES.NEWYEAR) {
      msg = "🎆 New Year\n\nNew Year seasonal theme has been successfully activated and the system is now running in this theme.";
    } else if (theme === THEMES.CHRISTMAS) {
      msg = "🎄 Christmas\n\nChristmas seasonal theme has been successfully activated and the system is now running in this theme.";
    } else {
      msg = "";
    }
    setThemeMessage(msg);
  }, [theme]);

  // Theme dropdown button state
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeOptions = [
    { value: THEMES.RAMADAN, label: "Ramadan" },
    { value: THEMES.CHRISTMAS, label: "Christmas" },
    { value: THEMES.NEWYEAR, label: "New Year" },
    { value: THEMES.PONGAL, label: "Pongal" },
    { value: THEMES.DEFAULT, label: "Default" },
  ];
  // Close dropdown on outside click
  React.useEffect(() => {
    if (!themeMenuOpen) return;
    const handler = (e) => {
      if (!e.target.closest(".theme-dropdown-container")) setThemeMenuOpen(false);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [themeMenuOpen]);
  // Dropdown background and theme UI logic retained natively
  return (
    <div className={`admin-dashboard-wrapper theme-${theme}`}>
      {/* Professional Sidebar Navigation */}
      <aside className="admin-sidebar shadow-lg">
        <div className="admin-sidebar-logo">
          <img src={logo} alt="Bird Nest" />
          <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Bird Nest</h3>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: 4 }}>Control Panel</span>
        </div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeSection === "room" ? "active" : ""}`}
            onClick={() => handleSectionClick("room")}
          >
            <span className="admin-nav-icon">📊</span>
            <span>Listings Management</span>
          </button>

          <button
            className={`admin-nav-item ${activeSection === "staff" ? "active" : ""}`}
            onClick={() => handleSectionClick("staff")}
          >
            <span className="admin-nav-icon">👥</span>
            <span>Staff Directory</span>
          </button>

          <button
            className={`admin-nav-item ${activeSection === "admin" ? "active" : ""}`}
            onClick={() => handleSectionClick("admin")}
          >
            <span className="admin-nav-icon">🛡️</span>
            <span>Staff Registration</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          {/* Theme Selector Dropdown */}
          <div className="theme-dropdown-container" style={{ position: 'relative', marginBottom: '1rem' }}>
            <button
              className={`admin-nav-item ${themeMenuOpen ? 'active' : ''}`}
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            >
              <span className="admin-nav-icon">🎨</span>
              <span>Appearance</span>
            </button>

            {themeMenuOpen && (
              <div className="theme-dropdown-menu shadow-lg" style={{
                position: 'absolute',
                bottom: '100%',
                left: '10px',
                width: '180px',
                background: 'white',
                borderRadius: '12px',
                padding: '8px',
                marginBottom: '10px',
                zIndex: 1000,
                border: '1px solid #eef2f6',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      selectTheme(opt.value);
                      setThemeMenuOpen(false);
                      // Trigger an immediate refresh for a clean UI state as requested
                      window.location.reload();
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: 'none',
                      background: theme === opt.value ? '#f0f4ff' : 'transparent',
                      textAlign: 'left',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: theme === opt.value ? '#1a237e' : '#4b5568',
                      fontWeight: theme === opt.value ? 700 : 500,
                      fontSize: '0.88rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { if (theme !== opt.value) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseOut={(e) => { if (theme !== opt.value) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {theme === opt.value && <span style={{ marginRight: 8 }}>•</span>}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {sessionStorage.getItem("token") && (
            <button
              className="admin-nav-item"
              style={{ color: '#ff4d4d' }}
              onClick={handleLogout}
            >
              <span className="admin-nav-icon">🚪</span>
              <span>Secure Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        <div style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
          <AppHeader appName="Bird Nest" tagline="High-Performance Admin Portal" />
        </div>
        {/* Main Content */}
        {/* Summary Statistics Cards */}
        <div className="admin-stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e3f2fd', color: '#1976d2' }}>🏢</div>
            <div className="stat-info">
              <h4>Total Listings</h4>
              <div>{summaryStats.totalRooms}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fff8e1', color: '#ffa000' }}>⏳</div>
            <div className="stat-info">
              <h4>Pending Approval</h4>
              <div style={{ color: summaryStats.pendingVerifications > 0 ? '#d32f2f' : 'inherit' }}>
                {summaryStats.pendingVerifications}
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e8f5e9', color: '#388e3c' }}>✅</div>
            <div className="stat-info">
              <h4>Verified</h4>
              <div>{summaryStats.verifiedListings}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fafafa', color: '#616161' }}>👥</div>
            <div className="stat-info">
              <h4>Staff Count</h4>
              <div>{summaryStats.staffCount}</div>
            </div>
          </div>
        </div>

        {/* Dynamic Content View Area */}
        <div className="admin-content-view">
          {message1 && <div className="alert alert-danger shadow-sm border-0" style={{ borderRadius: 12 }}>{message1}</div>}
          {/* Room Management Section */}
          {activeSection === "room" && (
            <section id="room-management" className="mb-5">
              <div className="admin-content-header">
                <h2 className="admin-page-title">Listings Management</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={openPdfModal}
                    className="btn shadow-sm"
                    style={{
                      background: '#fff',
                      color: '#1a237e',
                      border: '1px solid #dbe2ef',
                      borderRadius: 10,
                      fontWeight: 600,
                      padding: '8px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6zm0 2h12v16H6V4zm6 2a1 1 0 0 1 1 1v5.586l1.293-1.293a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414L11 12.586V7a1 1 0 0 1 1-1z" /></svg>
                    Generate PDF Report
                  </button>
                </div>
              </div>

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
              {/* Unverified Rooms Section */}
              <h4 className="admin-glass-subtitle" style={{ textAlign: 'left', marginLeft: 0, marginBottom: '1.5rem', color: '#4b79a1' }}>
                Pending Verifications
              </h4>
              {error && <div className="alert alert-danger" style={{ borderRadius: 10 }}>{error}</div>}

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2 text-muted">Fetching latest listings...</p>
                </div>
              ) : unverifiedRooms.length === 0 ? (
                <div className="admin-table-container p-5 text-center text-muted">
                  <span style={{ fontSize: '2rem' }}>🏘️</span>
                  <p className="mt-2">All caught up! No unverified rooms at the moment.</p>
                </div>
              ) : (
                <div className="admin-table-container mb-5">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Guest House</th>
                        <th>Location</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unverifiedRooms.map((room) => (
                        <React.Fragment key={room._id}>
                          <tr>
                            <td style={{ fontWeight: 600 }}>{room.name || room.roomType}</td>
                            <td>{room.roomCity || room.roomAddress}</td>
                            <td><span style={{ fontWeight: 600 }}>Rs {room.price?.toLocaleString()}</span></td>
                            <td>
                              <span className="status-badge status-pending">
                                <span className="pulse-dot"></span> Pending
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm"
                                style={{
                                  border: '1.2px solid #1a237e',
                                  color: '#1a237e',
                                  borderRadius: 30,
                                  fontWeight: 600,
                                  padding: '4px 14px'
                                }}
                                onClick={() => handleRoomClick(room)}
                              >
                                {selectedRoom?._id === room._id ? 'Close' : 'Review'}
                              </button>
                            </td>
                          </tr>
                          {selectedRoom?._id === room._id && (
                            <tr>
                              <td colSpan="5" className="p-0">
                                <div style={{ background: '#f8fafc', padding: '2rem', borderBottom: '1px solid #e2e8f0' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem' }}>
                                    {/* Left: Media */}
                                    <div>
                                      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                                        <img
                                          src={`http://localhost:8070${room.images[activeImageIndex]}`}
                                          alt="Room"
                                          style={{ width: '100%', height: '240px', objectFit: 'cover' }}
                                        />
                                      </div>
                                      <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto', paddingBottom: 10 }}>
                                        {room.images.map((img, idx) => (
                                          <img
                                            key={idx}
                                            src={`http://localhost:8070${img}`}
                                            alt="thumb"
                                            onClick={() => handleThumbnailClick(idx)}
                                            style={{
                                              width: 50, height: 50, borderRadius: 8, objectFit: 'cover', cursor: 'pointer',
                                              border: activeImageIndex === idx ? '2px solid #1a237e' : '1px solid #e2e8f0'
                                            }}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    {/* Right: Details */}
                                    <div style={{ color: '#2d3748' }}>
                                      <h5 style={{ fontWeight: 700, marginBottom: '1.5rem', color: '#1a237e' }}>Room Details</h5>
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 2rem' }}>
                                        <div><strong>Owner:</strong> {room.ownerName}</div>
                                        <div><strong>Contact:</strong> {room.ownerContactNumber}</div>
                                        <div><strong>Price:</strong> Rs {room.price?.toLocaleString()}</div>
                                        <div><strong>Negotiable:</strong> {room.isNegotiable ? 'Yes' : 'No'}</div>
                                        <div style={{ gridColumn: 'span 2' }}><strong>Address:</strong> {room.roomAddress}</div>
                                      </div>
                                      <div className="mt-4">
                                        <strong>Description:</strong>
                                        <p className="mt-1 text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{room.description}</p>
                                      </div>
                                      <div className="mt-4 d-flex gap-3">
                                        <button
                                          className="btn btn-success px-4"
                                          style={{ borderRadius: 8, fontWeight: 600 }}
                                          onClick={() => handleVerification(room._id)}
                                        >
                                          Verify & Publish
                                        </button>
                                        <button
                                          className="btn btn-outline-danger px-4"
                                          style={{ borderRadius: 8, fontWeight: 600 }}
                                          onClick={() => handleRejection(room._id)}
                                        >
                                          Reject
                                        </button>
                                      </div>
                                    </div>
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


              {/* Verified Rooms Section */}
              <h4 className="admin-glass-subtitle" style={{ textAlign: 'left', marginLeft: 0, marginBottom: '1.5rem', color: '#4b79a1', marginTop: '3rem' }}>
                Verified Listings
              </h4>

              {verifiedRooms.length === 0 ? (
                <p className="text-muted">No verified rooms found.</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table text-nowrap">
                    <thead>
                      <tr>
                        <th>Guest House</th>
                        <th>Approval Date</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verifiedRooms.map((room) => (
                        <React.Fragment key={room._id}>
                          <tr style={{ cursor: 'pointer' }} onClick={() => handleRoomClick(room)}>
                            <td style={{ fontWeight: 600 }}>{room.name || room.roomType}</td>
                            <td style={{ color: '#64748b' }}>{room.verifiedAt ? new Date(room.verifiedAt).toLocaleDateString() : '-'}</td>
                            <td>Rs {room.price?.toLocaleString()}</td>
                            <td>
                              {room.rejected ? (
                                <span className="status-badge status-rejected">Rejected</span>
                              ) : (
                                <span className="status-badge status-verified">Verified</span>
                              )}
                            </td>
                            <td><button className="btn btn-sm btn-link text-primary p-0">View</button></td>
                          </tr>
                          {selectedRoom?._id === room._id && (
                            <tr>
                              <td colSpan="5" className="p-0">
                                <div style={{ background: '#f8fafc', padding: '1.5rem' }}>
                                  <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>Full record for <strong>{room.ownerName}</strong>'s property is stored securely.</p>
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
            <section id="staff-management" className="mb-5">
              <div className="admin-content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h2 className="admin-page-title" style={{ margin: 0 }}>Staff Directory</h2>
                <button
                  className="btn btn-link p-0 border-0"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    width: '40px',
                    height: '40px',
                    color: selectedStaffIds.length > 0 ? '#dc3545' : '#ccc',
                    cursor: selectedStaffIds.length > 0 ? 'pointer' : 'not-allowed',
                    opacity: selectedStaffIds.length > 0 ? 1 : 0.4
                  }}
                  disabled={selectedStaffIds.length === 0}
                  onClick={handleBulkDelete}
                  title={selectedStaffIds.length > 0 ? `Delete ${selectedStaffIds.length} selected profiles` : "Select deactivated staff to delete"}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={selectedStaffIds.length > 0 && selectedStaffIds.length === allStaff.filter(s => s.role !== 'Admin').length}
                          onChange={handleSelectAllStaff}
                          style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                        />
                      </th>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Email</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allStaff.length > 0 ? allStaff.map((staff) => (
                      <tr key={staff._id}>
                        <td>
                          {staff.role !== 'Admin' && (
                            <input
                              type="checkbox"
                              checked={selectedStaffIds.includes(staff._id)}
                              disabled={staff.isActive !== false}
                              onChange={() => handleSelectStaff(staff._id, staff.role)}
                              style={{
                                cursor: staff.isActive !== false ? 'not-allowed' : 'pointer',
                                transform: 'scale(1.2)',
                                opacity: staff.isActive !== false ? 0.3 : 1
                              }}
                              title={staff.isActive !== false ? "Please deactivate this account before deleting" : "Select for deletion"}
                            />
                          )}
                        </td>
                        <td style={{ fontWeight: 600 }}>{staff.name} {staff.lname}</td>
                        <td><span className="text-muted">{staff.role?.replace(/_/g, ' ')}</span></td>
                        <td>{staff.email}</td>
                        <td style={{ textAlign: 'center' }}>
                          {staff.isActive !== false ? (
                            <span className="status-badge status-verified">Active</span>
                          ) : (
                            <span className="status-badge status-rejected">Deactivated</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', background: 'transparent' }}>
                          <div className="d-flex justify-content-end align-items-center gap-2" style={{ background: 'transparent' }}>
                            {staff.role === 'Admin' && staff.isActive !== false ? (
                              <span style={{ 
                                color: '#1a237e', 
                                fontWeight: 600, 
                                fontSize: '0.85rem', 
                                opacity: 0.8,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}>
                                🛡️ Protected
                              </span>
                            ) : (
                              <button
                                className="btn btn-sm"
                                style={{ 
                                  borderRadius: 30, 
                                  fontWeight: 600, 
                                  minWidth: '100px',
                                  padding: '6px 16px',
                                  fontSize: '0.8rem',
                                  letterSpacing: '0.3px',
                                  transition: 'all 0.25s ease',
                                  border: staff.isActive !== false ? '1.5px solid #ffcdd2' : '1.5px solid #c8e6c9',
                                  backgroundColor: 'transparent',
                                  color: staff.isActive !== false ? '#d32f2f' : '#2e7d32',
                                  boxShadow: 'none'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = staff.isActive !== false ? '#fff1f1' : '#f1f8f1';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = staff.isActive !== false ? '#fffcfc' : '#fcfdfc';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }}
                                onClick={() => handleToggleStaffStatus(staff._id, staff.isActive !== false)}
                              >
                                {staff.isActive !== false ? 'Deactivate' : 'Activate'}
                              </button>
                            )}

                            {/* Resend Credentials Button */}
                            {staff.role !== 'Admin' && (
                              <button
                                className="btn btn-sm"
                                title="Resend Credentials via Email"
                                style={{
                                  borderRadius: '50%',
                                  width: '35px',
                                  height: '35px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid #e2e8f0',
                                  backgroundColor: '#fff',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                                  e.currentTarget.style.borderColor = '#1a237e';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#fff';
                                  e.currentTarget.style.borderColor = '#e2e8f0';
                                }}
                                onClick={() => handleResendCredentials(staff._id, staff.name)}
                              >
                                ✉️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted">
                          <span style={{ fontSize: '2rem' }}>👥</span>
                          <p className="mt-2">No staff members found in the directory.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {/* Admin Personnel Registration Section */}
          {activeSection === "admin" && (
            <section id="admin-personnel" className="mb-5">
              <div className="admin-content-header">
                <h2 className="admin-page-title">Staff Registration</h2>
              </div>

              <div className="admin-table-container p-5" style={{ 
                maxWidth: 800, 
                boxShadow: '0 10px 40px rgba(0,0,0,0.04)', 
                borderRadius: 24,
                border: '1px solid rgba(226, 232, 240, 0.8)'
              }}>
                {regFlowState === 'form' ? (
                  <>
                    {registrationMessage && (
                      <div className={`alert ${registrationMessage.includes("successful") || registrationMessage.includes("✅") ? "alert-success" : "alert-danger"}`} 
                        style={{ 
                          borderRadius: 12, 
                          marginBottom: 30, 
                          border: 'none',
                          padding: '15px 20px',
                          fontWeight: 500,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}>
                        {registrationMessage}
                      </div>
                    )}

                    <form onSubmit={handleStaffRegistration} autoComplete="off">
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                        {[
                          { label: "First Name", value: name, setter: setName, placeholder: "First name", required: true, type: "text" },
                          { label: "Last Name", value: lname, setter: setLName, placeholder: "Last name", required: false, type: "text" },
                          { label: "Phone Number", value: phoneNumber, setter: setPhoneNumber, placeholder: "Ex: 0712345678", required: true, type: "tel" },
                          { label: "Email Address", value: email, setter: setEmail, placeholder: "staff@birdnest.com", required: true, type: "email" },
                          { label: "Assigned Role", value: role, setter: setRole, placeholder: "Select Role", required: true, type: "select" },
                          { label: "Password", value: password, setter: setPassword, placeholder: "Temporary password", required: true, type: "password" },
                          { label: "Confirm Password", value: confirmPassword, setter: setConfirmPassword, placeholder: "Repeat password", required: true, type: "password" },
                        ].map((field, idx) => (
                          <div key={idx} className="admin-glass-form-group" style={{ 
                            gridColumn: field.label === "Confirm Password" && idx % 2 === 0 ? "span 2" : "span 1" 
                          }}>
                            <label style={{ 
                              display: 'block', 
                              marginBottom: 8, 
                              fontSize: '0.75rem', 
                              fontWeight: 700, 
                              color: '#64748b', 
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                            </label>
                            {field.type === "select" ? (
                              <select 
                                value={field.value} 
                                onChange={(e) => field.setter(e.target.value)} 
                                required={field.required}
                                className="form-control admin-glass-input"
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: 12,
                                  height: '48px',
                                  padding: '0 16px',
                                  transition: 'all 0.2s',
                                  fontSize: '0.95rem'
                                }}
                              >
                                <option value="">{field.placeholder}</option>
                                <option value="Staff">Regular Staff</option>
                                <option value="Customer_Care">Customer Care</option>
                                <option value="Service_Agent">Service Agent</option>
                              </select>
                            ) : (
                              <input 
                                type={field.type} 
                                value={field.value} 
                                onChange={(e) => field.setter(e.target.value)} 
                                placeholder={field.placeholder} 
                                required={field.required}
                                className="form-control admin-glass-input"
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: 12,
                                  height: '48px',
                                  padding: '0 16px',
                                  transition: 'all 0.2s',
                                  fontSize: '0.95rem'
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = '#1a237e';
                                  e.target.style.background = '#fff';
                                  e.target.style.boxShadow = '0 0 0 4px rgba(26, 35, 126, 0.05)';
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = '#e2e8f0';
                                  e.target.style.background = '#f8fafc';
                                  e.target.style.boxShadow = 'none';
                                }}
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 text-center">
                        <button 
                          type="submit" 
                          className="btn admin-glass-btn-primary"
                          disabled={loading}
                          style={{ 
                            padding: '14px 40px', 
                            fontSize: '1rem', 
                            fontWeight: 700, 
                            borderRadius: 30,
                            background: '#1a237e',
                            color: 'white',
                            border: 'none',
                            boxShadow: '0 8px 25px rgba(26, 35, 126, 0.2)',
                            transition: 'all 0.3s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}
                        >
                          {loading ? "Processing..." : (
                            <>
                              Complete Registration
                              <span style={{ fontSize: '1.2rem' }}>→</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  /* Success Mode View */
                  <div className="text-center py-4">
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎯</div>
                    <h3 style={{ color: '#1a237e', fontWeight: 700, marginBottom: '8px' }}>Registration Complete!</h3>
                    <p style={{ color: '#64748b', marginBottom: '30px' }}>
                      Staff account for <strong>{lastRegisteredStaff?.name}</strong> has been successfully created.
                    </p>

                    <div style={{ 
                      background: '#f8fafc', 
                      borderRadius: 16, 
                      padding: '24px', 
                      margin: '0 auto 32px', 
                      maxWidth: '500px',
                      border: '1px solid #e2e8f0',
                      textAlign: 'left'
                    }}>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <span style={{ fontWeight: 600, color: '#444' }}>Credential Email Status:</span>
                        {lastRegisteredStaff?.emailSent ? (
                          <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.9rem' }}>✅ SENT SUCCESSFULLY</span>
                        ) : (
                          <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.9rem' }}>⚠️ DELIVERY FAILED</span>
                        )}
                      </div>

                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
                        {lastRegisteredStaff?.emailSent 
                          ? `New credentials have been delivered to ${lastRegisteredStaff?.email}.`
                          : `The system could not deliver credentials to ${lastRegisteredStaff?.email}. Please check your SMTP settings and retry below.`
                        }
                      </p>

                      <div className="d-flex gap-3">
                        <button 
                          className="btn btn-primary flex-grow-1"
                          style={{ borderRadius: 12, padding: '10px', background: '#1a237e', border: 'none' }}
                          onClick={() => handleResendCredentials(lastRegisteredStaff?.id, lastRegisteredStaff?.name)}
                        >
                          {lastRegisteredStaff?.emailSent ? "Resend Email" : "Send Email Now"}
                        </button>
                        <button 
                          className="btn btn-outline-secondary"
                          style={{ borderRadius: 12, padding: '10px' }}
                          onClick={() => {
                            setRegFlowState('form');
                            setLastRegisteredStaff(null);
                          }}
                        >
                          Finish
                        </button>
                      </div>
                    </div>

                    <button 
                      className="btn" 
                      style={{ color: '#1a237e', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'underline' }}
                      onClick={() => {
                        setRegFlowState('form');
                        setLastRegisteredStaff(null);
                      }}
                    >
                      + Register Another Staff Member
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
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
