import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import '../Componets/CSS/CustomerLogin.css';
import logo from "../Componets/assets/unistaylogo.png";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // Bootstrap alert type
  const [alertMessage, setAlertMessage] = useState(""); // Room booking alert
  const navigate = useNavigate(); // Navigation hook

  // Check if a token exists when the component mounts (for auto-login behavior)
  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      navigate("/dash", { replace: true });
    }
  }, [navigate]);

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8070/login", { email, password });
  
      // Save token in sessionStorage
      sessionStorage.setItem("token", response.data.token);
  
      // Set welcome message
      setMessage(`Welcome back, ${response.data.username}!`);
      setAlertType("success");
  
      // Check if there's an alert message about room booking
      if (response.data.alertMessage) {
        setAlertMessage(response.data.alertMessage);
      }
  
      // Construct the navigation state conditionally
      const navigationState = {
        message1: `Welcome, ${response.data.username}!`,
        alertType: "success",
      };
  
      if (response.data.alertMessage) {
        navigationState.message2 = response.data.alertMessage;
      }
  
      // Navigate to dashboard with the constructed state
      navigate("/dash", { state: navigationState });
  
    } catch (err) {
      setMessage(err.response?.data?.error || "Login failed!");
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

          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><a className="nav-link" href="/">Home</a></li>
              <li className="nav-item"><a className="nav-link" href="/register">Register</a></li>
             
            </ul>
          </div>
        </div>
      </nav>

      <div className="CLogin-container-body">
        <div className="CLogin-container">
          <h2 className="mt-4">Login</h2>
          <form onSubmit={handleLogin} className="w-60 mt-4">
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

          {/* Show success or error messages */}
          {message && (
            <div className={`alert alert-${alertType} mt-4`} role="alert">
              {message}
            </div>
          )}

          {/* Show alert if the user owns a booked room */}
          {alertMessage && (
            <div className="alert alert-warning mt-4" role="alert">
              {alertMessage}
            </div>
          )}

          <div className="text-center mt-3">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="text-primary">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
