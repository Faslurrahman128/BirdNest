import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import AppHeader from "../Componets/AppHeader";
import '../Componets/CSS/ViewServiceProvider.css';
import '../Componets/CSS/serviceAgentDash.css';
import {
  FaHome, FaUserClock, FaUserCheck, FaClipboardList,
  FaSignOutAlt, FaChartBar, FaCalendarAlt, FaShieldAlt
} from "react-icons/fa";

function ServiceAgentDash() {
  const sidebarWidth = 210;

  const [serviceTypeData, setServiceTypeData] = useState([]);
  const [dailyRegistrations, setDailyRegistrations] = useState([]);
  const [totalProviders, setTotalProviders] = useState(0);
  const [verifiedProviders, setVerifiedProviders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Chat / Socket state (from original doc1) ──────────────────────────────
  const [chatToasts, setChatToasts] = useState([]);
  const [chatUnreadCount, setChatUnreadCount] = useState(
    () => Number(sessionStorage.getItem("serviceAgentChatUnreadCount") || 0)
  );

  const token   = sessionStorage.getItem("token");
  const myId    = sessionStorage.getItem("userId") || "";
  const myRole  = (
    sessionStorage.getItem("role") ||
    sessionStorage.getItem("staffRole") ||
    ""
  ).toLowerCase();

  const resolveAuthContext = () => {
    let resolvedId   = myId;
    let resolvedRole = myRole;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (!resolvedId)   resolvedId   = payload?.id   || "";
        if (!resolvedRole) resolvedRole = (payload?.role || "").toLowerCase();
      } catch (_) {}
    }
    return { resolvedId, resolvedRole };
  };

  const pushChatToast = (text) => {
    const id = `${Date.now()}-${Math.random()}`;
    setChatToasts((prev) => [...prev.slice(-3), { id, text }]);
    setTimeout(() => {
      setChatToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // ── Socket listener ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const { resolvedId, resolvedRole } = resolveAuthContext();
    if (resolvedRole !== "service_agent") return;

    const socket = io("http://localhost:8070", {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("internal:new-message", (msg) => {
      const receiverRole  = (msg.receiverRole || "").toString().toLowerCase();
      const toAgentById   = resolvedId && String(msg.receiverId) === String(resolvedId);
      const toAgentByRole = receiverRole === "service_agent";
      if (!toAgentById && !toAgentByRole) return;

      pushChatToast(`New message from ${msg.senderName}`);
      setChatUnreadCount((prev) => {
        const next = prev + 1;
        sessionStorage.setItem("serviceAgentChatUnreadCount", String(next));
        return next;
      });
    });

    return () => { socket.disconnect(); };
  }, [token, myId, myRole]);

  const handleOpenChat = () => {
    setChatUnreadCount(0);
    sessionStorage.setItem("serviceAgentChatUnreadCount", "0");
  };

  // ── Dashboard data fetch ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const serviceTypeRes = await axios.get(
          "http://localhost:8070/ServiceProvider/service-type-counts"
        );
        setServiceTypeData(serviceTypeRes.data);
        const totalCount = serviceTypeRes.data.reduce((sum, item) => sum + item.count, 0);
        setTotalProviders(totalCount);

        const dailyRegRes = await axios.get(
          "http://localhost:8070/ServiceProvider/daily-registrations"
        );
        setDailyRegistrations(dailyRegRes.data);

        const verifiedRes = await axios.get(
          "http://localhost:8070/ServiceProvider/verified"
        );
        setVerifiedProviders(verifiedRes.data.length);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");

        const toastContainer = document.getElementById("toast-container");
        if (toastContainer) {
          const toast = document.createElement("div");
          toast.className = "toast-notification error";
          toast.innerHTML = "⚠ Failed to load dashboard data.";
          toastContainer.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getServiceTypeColor = (index) => {
    const colors = [
      "#4f8ef7", "#22c55e", "#f59e0b", "#a855f7",
      "#ef4444", "#06b6d4", "#f97316", "#84cc16",
    ];
    return colors[index % colors.length];
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const today    = new Date();
  const hour     = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#f8f9fa" }}>
      {/* App Header */}
      <div
        style={{
          width: `calc(100% - ${sidebarWidth}px)`,
          marginLeft: `${sidebarWidth}px`,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}>
          <AppHeader appName="Bird Nest" tagline="Service Agent Portal" />
        </div>
      </div>

      <div style={{ width: "95%", maxWidth: "1400px", margin: "0 auto" }}>
        <div className="dashboard-container" style={{ width: "100%", margin: "0", boxSizing: "border-box" }}>
          <div id="toast-container"></div>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <nav className="dashboard-menu">
            <div className="dashboard-brand">
              <div className="brand-logo">
                <div className="brand-icon">
                  <FaShieldAlt style={{ color: "#fff", fontSize: 18 }} />
                </div>
                <div>
                  <h2>Agent Panel</h2>
                  <p>Service Management</p>
                </div>
              </div>
            </div>

            <ul>
              <li className="active">
                <Link to="/service-agent-dash"><FaHome /><span>Dashboard</span></Link>
              </li>
              <li>
                <Link to="/service-provider-list"><FaUserClock /><span>Unverified Providers</span></Link>
              </li>
              <li>
                <Link to="/service-provider-verify"><FaUserCheck /><span>Verified Providers</span></Link>
              </li>

              {/* ── Admin Chat link with unread badge ── */}
              <li>
                <Link to="/internal-chat" onClick={handleOpenChat}>
                  <FaClipboardList /><span>Admin Chat</span>
                  {chatUnreadCount > 0 && (
                    <span
                      style={{
                        marginLeft: 8,
                        minWidth: 18,
                        height: 18,
                        borderRadius: 999,
                        background: "#ef4444",
                        color: "#fff",
                        fontSize: 11,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 6px",
                        fontWeight: 700,
                      }}
                    >
                      {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                    </span>
                  )}
                </Link>
              </li>
            </ul>

            <div className="sidebar-footer">
              <ul style={{ padding: 0 }}>
                <li className="logout">
                  <Link to="/"><FaSignOutAlt /><span>Logout</span></Link>
                </li>
              </ul>
            </div>
          </nav>

          {/* ── Main Content ─────────────────────────────────────────────── */}
          <div className="content-container">
            {/* Welcome Banner */}
            <div className="welcome-banner">
              <div>
                <h1>{greeting}, Agent 👋</h1>
                <p>
                  {today.toLocaleDateString(undefined, {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
              <div className="welcome-badge">Service Agent Dashboard</div>
            </div>

            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading dashboard data...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                <p>{error}</p>
                <button className="btn-retry" onClick={() => window.location.reload()}>
                  Retry
                </button>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="stats-cards">
                  <div className="stat-card">
                    <div className="stat-card-icon total"><FaUserClock /></div>
                    <div className="stat-card-content">
                      <h3>Total Providers</h3>
                      <p className="stat-value">{totalProviders}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon verified"><FaUserCheck /></div>
                    <div className="stat-card-content">
                      <h3>Verified</h3>
                      <p className="stat-value">{verifiedProviders}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon pending"><FaUserClock /></div>
                    <div className="stat-card-content">
                      <h3>Pending Review</h3>
                      <p className="stat-value">{totalProviders - verifiedProviders}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon recent"><FaCalendarAlt /></div>
                    <div className="stat-card-content">
                      <h3>Recent Sign-ups</h3>
                      <p className="stat-value">
                        {dailyRegistrations.length > 0
                          ? dailyRegistrations[dailyRegistrations.length - 1].count
                          : 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Service Type Distribution */}
                <div className="chart-section">
                  <div className="section-header">
                    <h3><FaChartBar /> Service Type Distribution</h3>
                  </div>
                  <div className="simple-chart">
                    {serviceTypeData.map((item, index) => (
                      <div key={index} className="chart-item">
                        <div className="chart-label">
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span
                              className="color-box"
                              style={{ backgroundColor: getServiceTypeColor(index) }}
                            ></span>
                            <span className="service-type-name">{item.serviceType}</span>
                          </div>
                          <span className="chart-value">
                            {item.count} ({((item.count / totalProviders) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="chart-bar-container">
                          <div
                            className="chart-bar"
                            style={{
                              width: `${(item.count / totalProviders) * 100}%`,
                              backgroundColor: getServiceTypeColor(index),
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Registrations */}
                <div className="registration-section">
                  <div className="section-header">
                    <h3><FaCalendarAlt /> Recent Daily Registrations</h3>
                  </div>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Registrations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyRegistrations.slice(-7).map((day, index) => (
                          <tr key={index}>
                            <td style={{ fontWeight: 500 }}>{formatDate(day.date)}</td>
                            <td>
                              <div className="registration-count">
                                <div
                                  className="registration-bar"
                                  style={{
                                    width: `${Math.min((day.count / 10) * 100, 100)}%`,
                                    backgroundColor: "#4f8ef7",
                                    minWidth: 4,
                                  }}
                                ></div>
                                <span style={{ fontWeight: 600, color: "#4f8ef7" }}>
                                  {day.count}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Chat Toast Notifications (bottom-right) ───────────────────────── */}
      <div
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 9999,
        }}
      >
        {chatToasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background: "#0f172a",
              color: "#fff",
              padding: "10px 12px",
              borderRadius: 10,
              minWidth: 220,
              boxShadow: "0 10px 30px rgba(2,6,23,0.35)",
              fontSize: 13,
            }}
          >
            {toast.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServiceAgentDash;