import React from "react";
import logo from "./assets/APPLOGO.png";
import "./CSS/AppHeader.css";


import { Link } from "react-router-dom";

const AppHeader = ({ appName = "Bird Nest", tagline = "Administration Made Powerful" }) => (
  <header className="admin-glass-header admin-glass-header-left">
    <div className="admin-glass-header-content-left">
      <img src={logo} alt="LOGO" className="admin-glass-logo" />
      <div className="admin-glass-header-title">
        <span className="admin-glass-app-name">{appName}</span>
        <span className="admin-glass-tagline">{tagline}</span>
      </div>
    </div>
    {/* Navigation removed for admin login/register header */}
  </header>
);

export default AppHeader;
