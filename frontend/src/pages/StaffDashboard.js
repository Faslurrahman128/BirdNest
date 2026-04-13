import React, { useEffect, useState } from "react";
import { useTheme, THEMES } from "../ThemeContext";
import "../Componets/CSS/theme-decorations.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import AppHeader from "../Componets/AppHeader";
import "../Componets/CSS/admin-glass.css";
import "../Componets/CSS/Admindash.css";
import logo from "../Componets/assets/APPLOGO.png";

function StaffDashboard() {
  const { theme, selectTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const staffName = sessionStorage.getItem("staffName") || location.state?.message?.replace('Welcome, ', '').replace('!', '') || "Staff Member";
  const staffEmail = sessionStorage.getItem("staffEmail") || "staff@birdnest.com";

  const [unverifiedRooms, setUnverifiedRooms] = useState([]);
  const [verifiedRooms, setVerifiedRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("staffDarkMode") === "true");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState({ text: "", type: "" });
  const token = sessionStorage.getItem("token");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdMsg({ text: "Passwords do not match.", type: "danger" });
      return;
    }
    try {
      await axios.put("http://localhost:8070/employee/change-password", {
        email: staffEmail,
        oldPassword,
        newPassword
      });
      setPwdMsg({ text: "Password changed successfully!", type: "success" });
      setTimeout(() => {
        setShowPwdModal(false);
        setPwdMsg({ text: "", type: "" });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }, 2000);
    } catch (err) {
      setPwdMsg({ text: err.response?.data?.error || "Failed to change password.", type: "danger" });
    }
  };

  // Fetch rooms logic (synchronized with Admin logic)
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8070/rooms", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const roomsData = response.data;

      let verified = roomsData.filter((room) => room.isVerified && !room.rejected);
      const rejected = roomsData.filter((room) => room.rejected === true);
      let unverified = roomsData.filter((room) => room.isVerified === false && !room.rejected);

      // Sort verified rooms by verifiedAt (desc)
      verified = verified.sort((a, b) => {
        const aDate = a.verifiedAt ? new Date(a.verifiedAt) : new Date(a.createdAt);
        const bDate = b.verifiedAt ? new Date(b.verifiedAt) : new Date(b.createdAt);
        return bDate - aDate;
      });

      // Sort unverified rooms by createdAt (desc)
      unverified = unverified.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setVerifiedRooms([...verified, ...rejected]);
      setUnverifiedRooms(unverified);
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Error fetching property listings. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/StaffLogin");
      return;
    }
    fetchRooms();
  }, [token, navigate]);

  // Aggregate stats
  const summaryStats = {
    totalRooms: verifiedRooms.length + unverifiedRooms.length,
    pendingVerifications: unverifiedRooms.length,
    verifiedListings: verifiedRooms.filter(r => !r.rejected).length,
  };

  // Improved Approval Handler
  const handleApprove = async (id) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:8070/Room/verify/${id}`,
        { isVerified: true, rejected: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchRooms();
      setSelectedRoom(null);
      alert("Property successfully verified.");
      setLoading(false);
    } catch (err) {
      setError("Failed to verify property.");
      setLoading(false);
    }
  };

  // Improved Rejection Handler
  const handleReject = async (id) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:8070/Room/verify/${id}`,
        { isVerified: false, rejected: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchRooms();
      setSelectedRoom(null);
      alert("Property request rejected.");
      setLoading(false);
    } catch (err) {
      setError("Failed to reject property.");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/StaffLogin", { replace: true });
  };

  return (
    <div className={`admin-dashboard-wrapper theme-${theme} ${isDarkMode ? 'theme-dark' : ''}`}>
      {/* Staff Sidebar Section */}
      <aside className="admin-sidebar shadow-lg">
        <div className="admin-sidebar-logo">
          <img src={logo} alt="Bird Nest" />
          <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Bird Nest</h3>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: 4 }}>Staff Portal</span>
        </div>

        <nav className="admin-nav">
          <button className="admin-nav-item active">
            <span className="admin-nav-icon">📊</span>
            <span>Listings Management</span>
          </button>

          {/* Email Access Button */}
          <button
            className="admin-nav-item"
            onClick={() => window.open('https://mail.google.com/', '_blank')}
          >
            <span className="admin-nav-icon">✉️</span>
            <span>Check Email</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer" style={{ padding: '0 10px 20px' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
            <button
              className="admin-nav-item"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{ justifyContent: 'space-between', paddingRight: '15px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="admin-nav-icon">👤</span>
                <span>My Profile</span>
              </div>
              <span style={{ fontSize: '0.8rem', transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>▼</span>
            </button>

            {/* Expandable Profile Menu */}
            {showProfileMenu && (
              <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '10px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', padding: '4px 8px', wordBreak: 'break-all' }}>
                  {staffEmail}
                </div>

                <button
                  className="btn btn-sm"
                  style={{ color: 'white', textAlign: 'left', padding: '8px', background: 'transparent', border: 'none', transition: '0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={() => setShowPwdModal(true)}
                >
                  🔒 Reset Password
                </button>

                <button
                  className="btn btn-sm"
                  style={{ color: '#ff4d4d', textAlign: 'left', padding: '8px', background: 'transparent', border: 'none', transition: '0.2s', fontWeight: 600 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,77,77,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={handleLogout}
                >
                  🚪 Secure Logout
                </button>
              </div>
            )}

            {/* Dark Mode Toggle remains outside the expandable menu for quick access */}
            <button
              className="admin-nav-item"
              style={{ marginTop: '10px' }}
              onClick={() => {
                const newMode = !isDarkMode;
                setIsDarkMode(newMode);
                localStorage.setItem("staffDarkMode", newMode);
              }}
            >
              <span className="admin-nav-icon">{isDarkMode ? '☀️' : '🌙'}</span>
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        <div style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
          <AppHeader appName="Bird Nest" tagline={`Welcome back, ${staffName}`} />
        </div>

        {/* Real-time Stats Grid */}
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
        </div>

        <div className="admin-content-view">
          {/* Pending Verifications Table */}
          <section className="mb-5">
            <div className="admin-content-header">
              <h2 className="admin-page-title">Pending Property Approvals</h2>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Property Info</th>
                    <th>Owner</th>
                    <th>Location</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {unverifiedRooms.length > 0 ? unverifiedRooms.map((room) => (
                    <tr key={room._id}>
                      <td>
                        <img
                          src={room.images?.[0]?.startsWith('http') ? room.images[0] : `http://localhost:8070${room.images?.[0]?.startsWith('/') ? room.images[0] : '/uploads/' + room.images?.[0]}`}
                          alt="room"
                          style={{ width: 60, height: 45, borderRadius: 8, objectFit: 'cover' }}
                          onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/60x45?text=No+Img'; }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{room.roomType}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Submitted: {new Date(room.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td>{room.ownerName || 'Unknown'}</td>
                      <td>{room.roomCity}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-sm btn-success"
                            style={{ borderRadius: 20, padding: '5px 15px', fontWeight: 600 }}
                            onClick={() => handleApprove(room._id)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            style={{ borderRadius: 20, padding: '5px 15px', fontWeight: 600 }}
                            onClick={() => handleReject(room._id)}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="text-center py-5 text-muted">No pending property requests found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recently Verified Table */}
          <section>
            <div className="admin-content-header">
              <h2 className="admin-page-title">Recent Actions</h2>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Processed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {verifiedRooms.length > 0 ? verifiedRooms.slice(0, 10).map((room) => (
                    <tr key={room._id}>
                      <td style={{ fontWeight: 600 }}>{room.roomType}</td>
                      <td>
                        <span className={`status-badge ${room.rejected ? 'status-rejected' : 'status-verified'}`}>
                          {room.rejected ? 'Rejected' : 'Verified'}
                        </span>
                      </td>
                      <td>{room.roomCity}</td>
                      <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                        {new Date(room.verifiedAt || room.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="text-center py-5 text-muted">No verification history available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* Password Reset Modal */}
      {showPwdModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: isDarkMode ? '#1e293b' : 'white', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: isDarkMode ? 'white' : '#1a237e', marginBottom: '20px', fontWeight: 700 }}>Reset Password</h3>

            {pwdMsg.text && (
              <div className={`alert alert-${pwdMsg.type}`} style={{ padding: '10px', fontSize: '0.9rem', borderRadius: '8px' }}>
                {pwdMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordChange}>
              <div className="mb-3">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: isDarkMode ? '#cbd5e1' : '#64748b' }}>Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  style={{ background: isDarkMode ? '#0f172a' : '#f8fafc', border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`, color: isDarkMode ? 'white' : 'black' }}
                />
              </div>
              <div className="mb-3">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: isDarkMode ? '#cbd5e1' : '#64748b' }}>New Password (min 8 chars)</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ background: isDarkMode ? '#0f172a' : '#f8fafc', border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`, color: isDarkMode ? 'white' : 'black' }}
                />
              </div>
              <div className="mb-4">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: isDarkMode ? '#cbd5e1' : '#64748b' }}>Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ background: isDarkMode ? '#0f172a' : '#f8fafc', border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`, color: isDarkMode ? 'white' : 'black' }}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light" onClick={() => setShowPwdModal(false)} style={{ background: isDarkMode ? '#334155' : '#f1f5f9', color: isDarkMode ? 'white' : 'black', border: 'none' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#1a237e', border: 'none' }}>
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffDashboard;
