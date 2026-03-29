import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import '../Componets/CSS/CustomerLogin.css';
import logo from "../Componets/assets/unistaylogo.png";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
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
    }
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <div className="LOGO-container">
            <a className="nav-link text-warning" href="/">
              <img src={logo} alt="LOGO" width="130" />
            </a>
          </div>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          
        </div>
      </nav>

      <div className="CLogin-container-body">
        <div className="CLogin-container">
          <h2 className="mt-4">Staff Login</h2>
          <form onSubmit={handleAdminLogin} className="w-60 mt-4">
            <div className="mb-3">
              <label htmlFor="email" className="Loginform-label">Email:</label>
              <input
                type="email"
                className="Loginform-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="Loginform-label">Password:</label>
              <input
                type="password"
                className="Loginform-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="Loginbtn btn-primary w-100">Login</button>
          </form>

          {/* Show the alert message based on login status */}
          {message && (
            <div className={`alert alert-${alertType} mt-4`} role="alert">
              {message}
            </div>
          )}

          <div className="text-center mt-3">
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;