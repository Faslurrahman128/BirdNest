import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../Componets/CSS/StaffLogin.css';
import AppHeader from "../Componets/AppHeader";

function ServiceAgentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Only allow emails containing 'service' (simple check)
      if (!email.toLowerCase().includes("service")) {
        setError("Only service agent emails are allowed.");
        setLoading(false);
        return;
      }
      // Call backend for authentication (adjust endpoint as needed)
      const res = await axios.post("http://localhost:8070/service-agent/login", { email, password });
      if (res.data && res.data.token) {
        sessionStorage.setItem("token", res.data.token);
        navigate("/service-agent-dash");
      } else {
        setError("Invalid credentials.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    }
    setLoading(false);
  };

  return (
    <div className="staff-login-bg">
      <AppHeader />
      <div className="staff-login-container">
        <div className="staff-card">
          <h2 className="staff-title">Service Agent Login</h2>
          <form onSubmit={handleSubmit} className="staff-form">
            <div className="staff-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="username"
                placeholder="Enter your service agent email"
              />
            </div>
            <div className="staff-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </div>
            {error && <div className="staff-alert staff-alert--error">{error}</div>}
            <button type="submit" className="staff-btn" disabled={loading}>
              {loading ? (
                <span className="staff-btn-loading">
                  <span className="staff-spinner" />
                  Signing in...
                </span>
              ) : (
                <span>Sign In <span className="staff-btn-arrow">→</span></span>
              )}
            </button>
          </form>
          <div className="staff-card-footer">
            <button
              type="button"
              className="staff-footer-link"
              style={{marginTop: '8px', display: 'inline-block', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '1rem'}}
              onClick={() => navigate('/StaffLogin')}
              aria-label="Back to Staff Login"
            >
              ← Back to Staff Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceAgentLogin;
