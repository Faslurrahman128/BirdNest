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
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const staffName = location.state?.message?.replace('Welcome, ', '').replace('!', '') || "Staff Member";
  
  const [unverifiedRooms, setUnverifiedRooms] = useState([]);
  const [verifiedRooms, setVerifiedRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const token = sessionStorage.getItem("token");

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
    <div className={`admin-dashboard-wrapper theme-${theme}`}>
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
        </nav>

        <div className="admin-sidebar-footer">
          <button
            className="admin-nav-item"
            style={{ color: '#ff4d4d' }}
            onClick={handleLogout}
          >
            <span className="admin-nav-icon">🚪</span>
            <span>Secure Logout</span>
          </button>
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
                          onError={e => { e.target.onerror=null; e.target.src='https://via.placeholder.com/60x45?text=No+Img'; }}
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
    </div>
  );
}

export default StaffDashboard;
