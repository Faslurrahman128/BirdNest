

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import '../Componets/CSS/CustomerLogin.css';

import AppHeader from "../Componets/AppHeader";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8070/admin/login", { email, password });
      setMessage(`Welcome back, ${response.data.username}!`);
      setAlertType("success");
      sessionStorage.setItem("token", response.data.token);

      // Check if email contains "service" (case-insensitive)
      const isServiceAgent = email.toLowerCase().includes("service");
      const dashboardPath = isServiceAgent ? "/service-agent-dash" : "/Admindash";

      navigate(dashboardPath, {
        state: { message: `Welcome, ${response.data.username}!`, alertType: "success" },
      });
    } catch (err) {
      setMessage(err?.response?.data?.error || "Admin login failed!");
      setAlertType("danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-glass-bg">
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
      {/* Reusable App Header matching AdminRegister */}
      <AppHeader appName="Bird Nest" tagline="Empowering Admins, Effortlessly" />
      <div className="admin-glass-center">
        <div className="admin-glass-card">
          <h2 className="admin-glass-title">Admin Login</h2>
          <span className="admin-glass-subtitle">Sign in to your admin account</span>
          <form onSubmit={handleAdminLogin} className="admin-glass-form">
            <div className="admin-glass-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                className="admin-glass-input"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="admin-glass-form-group">
              <label htmlFor="password">Password</label>
              <div className="admin-glass-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="admin-glass-input"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="admin-glass-toggle-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // Eye with slash (hide password)
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4b79a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C7 19 2.73 15.11 1 12c2.73-4.89 7-8 11-8 2.03 0 3.97.5 5.66 1.38" />
                      <path d="M1 1l22 22" />
                      <path d="M9.88 9.88A3 3 0 0 1 12 9c1.66 0 3 1.34 3 3 0 .39-.08.76-.22 1.1" />
                    </svg>
                  ) : (
                    // Eye (show password)
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4b79a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12C2.73 7.11 7 4 12 4s9.27 3.11 11 8c-1.73 4.89-6 8-11 8s-9.27-3.11-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="admin-glass-forgot-link">
                <Link to="/forgot-password" className="admin-glass-link">Forgot password?</Link>
              </div>
            </div>
            <button type="submit" className="admin-glass-btn" disabled={loading}>
              {loading ? (
                <span className="admin-glass-spinner"></span>
              ) : (
                "Login"
              )}
            </button>
          </form>
          {message && (
            <div className={`admin-glass-alert admin-glass-alert-${alertType}`}>
              {alertType === "success" ? (
                <span className="admin-glass-alert-icon" role="img" aria-label="success">✔️</span>
              ) : alertType === "danger" ? (
                <span className="admin-glass-alert-icon" role="img" aria-label="error">❌</span>
              ) : null}
              {message}
            </div>
          )}
          <div className="admin-glass-register-link">
            Not registered?{' '}
            <Link to="/AdminRegister" className="admin-glass-link">
              Register as Admin
            </Link>
          </div>
        </div>
      </div>
      <div className="admin-glass-copyright">
        &copy; {new Date().getFullYear()} Bird Nest. All rights reserved.
      </div>
      {/* Glassmorphism Styles (except header, now in AppHeader) */}
      <style>{`
        .admin-bg-svg {
          position: absolute;
          left: 0; top: 0; width: 100vw; height: 100vh;
          z-index: 0;
          pointer-events: none;
        }
        .admin-glass-bg {
          min-height: 100vh;
          width: 100vw;
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .admin-glass-bg::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
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
        .admin-glass-center, .admin-glass-copyright {
          position: relative;
          z-index: 2;
        }
        .admin-glass-center {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .admin-glass-card {
          background: rgba(255,255,255,0.25);
          border-radius: 22px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1.5px solid rgba(255,255,255,0.25);
          max-width: 410px;
          width: 100%;
          padding: 2.7rem 2.2rem 2.2rem 2.2rem;
          margin: 2.5rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .admin-glass-title {
          color: #1a237e;
          font-size: 2.1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          letter-spacing: 0.5px;
        }
        .admin-glass-subtitle {
          color: #4b79a1;
          font-size: 1.05rem;
          margin-bottom: 1.7rem;
        }
        .admin-glass-form {
          width: 100%;
        }
        .admin-glass-form-group {
          margin-bottom: 1.2rem;
          display: flex;
          flex-direction: column;
        }
        .admin-glass-form-group label {
          color: #232f3e;
          font-weight: 600;
          margin-bottom: 0.4rem;
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
        .admin-glass-forgot-link {
          margin-top: 0.3rem;
          text-align: right;
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
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;