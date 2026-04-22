import React, { useState } from "react";
import { ThemeProvider, useTheme, THEMES } from "../ThemeContext";
import AppHeader from "../Componets/AppHeader";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function AdminRegisterContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [Lname, setLName] = useState("");
  const [Phonenumber, setPhonenumber] = useState("");
  const [createdAt, setcreatedAt] = useState("");
  const [loading, setLoading] = useState(false);
 
  const [alert, setAlert] = useState({ type: '', message: '' });

  const navigate = useNavigate();

  function sendData(e) {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!name || !Phonenumber || !email || !password) {
      setAlert({ type: 'danger', message: 'Please fill out all required fields (Name, Phone Number, Email, and Password).' });
      return;
    }
    // First name must only contain letters (no symbols or special characters)
    if (!/^[A-Za-z]+$/.test(name)) {
      setAlert({ type: 'danger', message: 'First name can only contain letters (no symbols or special characters).' });
      return;
    }
    // Last name must only contain letters (if provided)
    if (Lname && !/^[A-Za-z]+$/.test(Lname)) {
      setAlert({ type: 'danger', message: 'Last name can only contain letters (no symbols or special characters).' });
      return;
    }
    // Phone number must be exactly 10 digits
    if (!/^\d{10}$/.test(Phonenumber)) {
      setAlert({ type: 'danger', message: 'Phone number must be exactly 10 digits.' });
      return;
    }
    if (password !== confirmPassword) {
      setAlert({ type: 'danger', message: 'Passwords do not match. Please try again.' });
      return;
    }

    const newAdmin = {
      name,
      email,
      password,
      Lname,
      Phonenumber,
      createdAt
    };

    setLoading(true);
    axios
      .post("http://localhost:8070/Adminregister", newAdmin)
      .then(() => {
        setAlert({ type: 'success', message: 'Admin registration successful!' });
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setLName("");
        setPhonenumber("");
        setcreatedAt("");
        setTimeout(() => {
          navigate("/AdminLogin");
        }, 1200);
      })
      .catch((err) => {
        setAlert({ type: 'danger', message: err.response ? err.response.data.error : "An error occurred" });
      })
      .finally(() => setLoading(false));
  }

  const { theme } = useTheme();
  React.useEffect(() => {
    if (!theme) return;
    // Log the screen resolution whenever the theme changes
    console.log('Theme selected:', theme, 'Resolution:', window.innerWidth + 'x' + window.innerHeight);
  }, [theme]);

  return (
    <>
      <div className={`admin-glass-bg theme-${theme}`} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
        <AppHeader appName="Bird Nest" tagline="Admin Registration" />
        <div className="admin-glass-center" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', zIndex: 2 }}>
          <div className="admin-glass-card" style={{ margin: 0 }}>
                      <h2 className="admin-glass-title">Admin Registration</h2>
                      <form className="admin-glass-form" onSubmit={sendData} autoComplete="off">
                        <div className="admin-glass-form-group-row">
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
                            <label htmlFor="Lastname">Last Name (opt)</label>
                            <input
                              type="text"
                              className="admin-glass-input"
                              id="Lastname"
                              placeholder="Last name"
                              onChange={(e) => setLName(e.target.value)}
                              value={Lname}
                            />
                          </div>
                        </div>
                        <div className="admin-glass-form-group-row">
                          <div className="admin-glass-form-group">
                            <label htmlFor="Phonenumber1">Phone Number <span style={{ color: '#c62828' }}>*</span></label>
                            <input
                              type="number"
                              className="admin-glass-input"
                              id="Phonenumber1"
                              placeholder="Phone number"
                              onChange={(e) => setPhonenumber(e.target.value)}
                              value={Phonenumber}
                              required
                            />
                          </div>
                        </div>
                        <div className="admin-glass-form-group">
                          <label htmlFor="useremail">Email <span style={{ color: '#c62828' }}>*</span></label>
                          <input
                            type="email"
                            className="admin-glass-input"
                            id="useremail"
                            placeholder="e.g. admin@example.com"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            required
                          />
                        </div>
                        <div className="admin-glass-form-group-row">
                          <div className="admin-glass-form-group admin-glass-password-wrapper">
                            <label htmlFor="userpassword">Password <span style={{ color: '#c62828' }}>*</span></label>
                            <input
                                type="password"
                                className="admin-glass-input"
                                id="userpassword"
                                placeholder="Password"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                required
                                autoComplete="new-password"
                              />
                          </div>
                          <div className="admin-glass-form-group admin-glass-password-wrapper">
                            <label htmlFor="confirmPassword">Confirm Password <span style={{ color: '#c62828' }}>*</span></label>
                            <input
                                type="password"
                                className="admin-glass-input"
                                id="confirmPassword"
                                placeholder="Confirm Password"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                value={confirmPassword}
                                required
                                autoComplete="new-password"
                              />
                          </div>
                        </div>
                        <button type="submit" className="admin-glass-btn" disabled={loading}>
                          {loading && <span className="admin-glass-spinner" />}
                          Register
                        </button>
                      </form>
                      {alert.message && (
                        <div className={`admin-glass-alert admin-glass-alert-${alert.type}`}> 
                          <span className="admin-glass-alert-icon">
                            {alert.type === 'success' ? (
                              <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#a5d6a7"/><path d="M6 10.5l2.5 2.5 5-5" stroke="#388e3c" strokeWidth="2" fill="none"/></svg>
                            ) : (
                              <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#ef9a9a"/><path d="M7 7l6 6M13 7l-6 6" stroke="#c62828" strokeWidth="2" fill="none"/></svg>
                            )}
                          </span>
                          {alert.message}
                        </div>
                      )}
                      <div className="admin-glass-register-link">
                        Already an Admin?
                        <Link to="/AdminLogin" className="admin-glass-link"> Admin Login</Link>
                      </div>
                    {/* ...existing code... */}
                    </div>
                  {/* ...existing code... */}
                  </div>
      <footer style={{ width: "100%", textAlign: "center", marginTop: "2rem", color: "#4b79a1", fontSize: "0.98rem", opacity: 0.85, zIndex: 2, position: "relative" }}>
        © {new Date().getFullYear()} Bird Nest. All rights reserved.
      </footer>
                  <style>{`
          z-index: 0;
          background: linear-gradient(120deg, #e0e7ef 0%, #c9d6ff 40%, #b7cbe6 100%);
          animation: admin-bg-gradient 8s ease-in-out infinite alternate;
        }
        .admin-glass-bg::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 1;
          background: radial-gradient(circle at 80% 20%, rgba(76,175,255,0.10) 0%, rgba(255,255,255,0.00) 60%),
                      radial-gradient(circle at 20% 80%, rgba(76,175,80,0.10) 0%, rgba(255,255,255,0.00) 60%);
          pointer-events: none;
        }
        @keyframes admin-bg-gradient {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
        .admin-bg-svg {
          position: absolute;
          left: 0; top: 0; width: 100vw; height: 100vh;
          z-index: 0;
          pointer-events: none;
        }
        .admin-glass-card {
          position: relative;
          z-index: 2;
          background: rgba(255,255,255,0.85);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
          border-radius: 24px;
          padding: 2.2rem 2.2rem 1.5rem 2.2rem;
          max-width: 480px;
          width: 100%;
          margin: 2.5rem auto 1.5rem auto;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .admin-glass-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 0.7rem;
          background: linear-gradient(90deg, #232946 0%, #1a237e 100%);
          border-radius: 0 0 16px 16px;
          padding: 0.7rem 1.2rem 0.7rem 1.2rem;
          box-shadow: 0 2px 12px rgba(30, 40, 80, 0.13);
        }
        .admin-glass-header-content-left {
          display: flex;
          align-items: flex-start;
          gap: 0.7rem;
        }
        .admin-glass-logo {
          width: 48px;
          height: 48px;
          object-fit: contain;
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(44, 62, 80, 0.10);
        }
        .admin-glass-header-title {
          display: flex;
          flex-direction: column;
          gap: 0.08rem;
        }
        .admin-glass-app-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f4f4f4;
          letter-spacing: 0.01em;
          text-shadow: 0 1px 4px rgba(20, 20, 40, 0.18);
        }
        .admin-glass-tagline {
          font-size: 0.7rem;
          color: #b7cbe6;
          margin-top: 0.05rem;
          font-family: 'Segoe Script', 'Pacifico', 'Dancing Script', 'Caveat', cursive, sans-serif;
          font-style: italic;
          text-shadow: 0 1px 4px rgba(20, 20, 40, 0.13);
        }
        .admin-glass-header-content-right {
          display: flex;
          align-items: flex-start;
        }
        .admin-glass-admin-indicator {
          background: linear-gradient(90deg, #4b79a1 0%, #1a237e 100%);
          color: #fff;
          font-size: 0.95rem;
          font-weight: 600;
          padding: 0.22rem 0.85rem;
          border-radius: 8px;
          letter-spacing: 0.04em;
          margin-top: 0.2rem;
        }
        .admin-glass-title {
          text-align: center;
          font-size: 1.35rem;
          font-weight: 700;
          color: #1a237e;
          margin-bottom: 1.1rem;
          margin-top: 0.2rem;
        }
        .admin-glass-form {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        .admin-glass-form-group-row {
          display: flex;
          gap: 1.1rem;
        }
        .admin-glass-form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .admin-glass-password-wrapper {
          display: flex;
          align-items: center;
          position: relative;
        }
        .admin-glass-toggle-password {
          background: none;
          border: none;
          outline: none;
          cursor: pointer;
          position: absolute;
          right: 0.7rem;
          top: 50%;
          transform: translateY(-50%);
          padding: 0 0.2rem;
          z-index: 2;
          display: flex;
          align-items: center;
        }
        .admin-glass-input {
          width: 100%;
          padding: 0.7rem 1rem;
          border: 1.5px solid #dbe2ef;
          border-radius: 10px;
          font-size: 1rem;
          background: rgba(255,255,255,0.7);
          box-shadow: 0 2px 8px rgba(44, 62, 80, 0.04);
          transition: border 0.2s, box-shadow 0.2s;
          padding-right: 2.2rem;
        }
        .admin-glass-input:focus {
          border-color: #4b79a1;
          outline: none;
          box-shadow: 0 4px 16px rgba(44, 62, 80, 0.10);
        }
        .admin-glass-btn {
          width: 100%;
          padding: 0.9rem 0;
          background: linear-gradient(90deg, #4b79a1 0%, #1a237e 100%);
          color: #fff;
          font-size: 1.15rem;
          font-weight: 700;
          border: none;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(44, 62, 80, 0.10);
          cursor: pointer;
          margin-top: 0.5rem;
          transition: background 0.2s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .admin-glass-btn:hover {
          background: linear-gradient(90deg, #1a237e 0%, #4b79a1 100%);
          box-shadow: 0 4px 16px rgba(44, 62, 80, 0.16);
        }
        .admin-glass-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .admin-glass-spinner {
          width: 22px;
          height: 22px;
          border: 3px solid #fff;
          border-top: 3px solid #4b79a1;
          border-radius: 50%;
          animation: admin-glass-spin 0.8s linear infinite;
          display: inline-block;
        }
        @keyframes admin-glass-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .admin-glass-alert {
          width: 100%;
          margin-top: 1.2rem;
          padding: 0.7rem 1rem;
          border-radius: 8px;
          font-size: 1rem;
          text-align: center;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
        }
        .admin-glass-alert-success {
          background: rgba(76, 175, 80, 0.13);
          color: #388e3c;
          border: 1px solid #a5d6a7;
        }
        .admin-glass-alert-danger {
          background: rgba(244, 67, 54, 0.13);
          color: #c62828;
          border: 1px solid #ef9a9a;
        }
        .admin-glass-alert-icon {
          font-size: 1.3rem;
          margin-right: 0.2rem;
        }
        .admin-glass-register-link {
          text-align: center;
          margin-top: 2.1rem;
          color: #888;
          font-size: 1rem;
        }
        .admin-glass-link {
          color: #1a237e;
          font-weight: 600;
          text-decoration: underline;
          margin-left: 2px;
        }
        .admin-glass-link:hover {
          color: #4b79a1;
        }
        .admin-glass-copyright {
          width: 100%;
          text-align: center;
          color: #888;
          font-size: 0.98rem;
          margin-bottom: 1.2rem;
          margin-top: 1.5rem;
        }
        @media (max-width: 600px) {
          .admin-bg-svg {
            height: 320px;
            min-height: 220px;
          }
          .admin-glass-card {
            padding: 1.2rem 0.7rem 1rem 0.7rem;
            max-width: 98vw;
          }
          .admin-glass-header-content-left {
            padding: 0 0.5rem;
          }
          .admin-glass-header-title {
            gap: 0.02rem;
          }
          .admin-glass-app-name {
            font-size: 1.1rem;
          }
          .admin-glass-tagline {
            font-size: 0.65rem;
            margin-top: 0.01rem;
            font-family: 'Segoe Script', 'Pacifico', 'Dancing Script', 'Caveat', cursive, sans-serif;
            font-style: italic;
          }
        }
        @media (max-width: 600px) {
          .admin-glass-card {
            padding: 1.2rem 0.7rem 1rem 0.7rem;
          }
          .admin-glass-header-content-left {
            padding: 0 0.5rem;
          }
        }

        `}</style>
      </div>
    </>
  );
}

// Use global ThemeProvider (do not wrap here)
const AddAdmin = () => <AdminRegisterContent />;

export default AddAdmin;
