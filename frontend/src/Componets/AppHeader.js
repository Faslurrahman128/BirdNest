import React from "react";
import logo from "./assets/APPLOGO.png";
import "./CSS/AppHeader.css";
import { useNavigate } from "react-router-dom";

const AppHeader = ({ 
  appName = "Bird Nest", 
  tagline = "Administration Made Powerful",
  showLogout = false,
  onLogout = null
}) => {
  const navigate = useNavigate();
  
  // Check if user is logged in (either through props or sessionStorage)
  const isLoggedIn = showLogout || !!sessionStorage.getItem("token");

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      sessionStorage.removeItem("token");
      navigate("/StaffLogin", { replace: true });
    }
  };

  return (
    <header className="admin-glass-header admin-glass-header-left">
      <div className="admin-glass-header-content-left">
        <img src={logo} alt="LOGO" className="admin-glass-logo" />
        <div className="admin-glass-header-title">
          <span className="admin-glass-app-name">{appName}</span>
          <span className="admin-glass-tagline">{tagline}</span>
        </div>
      </div>
      <div className="admin-glass-header-content-right">
        {/* Logout button removed as requested */}
      </div>
    </header>
  );
};

export default AppHeader;