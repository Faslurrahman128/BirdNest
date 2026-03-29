import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../Componets/CSS/RegisterServiceProvider.css';
import logo from "../Componets/assets/unistaylogo.png";

function RegisterServiceProvider() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    
    if (!token) {
      alert("You must be logged in to register as a service provider.");
      return;
    }
    
    if (!name || !email || !phoneNumber || !serviceArea || !serviceType) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8070/ServiceProvider/register", {
        name,
        email,
        phoneNumber,
        serviceArea,
        serviceType,
        description,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(response.data.message);
      navigate("/dash");
    } catch (error) {
      alert(error.response?.data?.error || "Error registering. Please try again later.");
    }
  };

  // Logout function
  const handleLogout = () => {
    // Remove token from sessionStorage
    sessionStorage.removeItem("token");
    // Redirect to login page
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Navigation Bar and Welcome Section Combined */}
      <div className="navbar navbar-expand-lg">
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
              <li className="nav-item">
                <a className="nav-link" href="/dash">Dashboard</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/AddRoom">Post Add</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/RoomList">Properties</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/Userroom">About Us</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/service-providers">Services</a>
              </li>
              {/* Dropdown Menu */}
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="profileDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Account
                </a>
                <ul className="dropdown-menu" aria-labelledby="profileDropdown">
                  <li><a className="dropdown-item" href="/profile">View Profile</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="/MyRoom">My Room</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="/MyListings">My Listings</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="/register-service-provider">Service Provider</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="/saved-providers">Bookmarks</a></li>
                  <li><hr className="dropdown-divider" /></li> 
                  <li>
                    {sessionStorage.getItem("token") && (
                      <li className="nav-item">
                        <button className="dropdown-item" onClick={handleLogout}><strong>Logout</strong></button>
                      </li>
                    )}
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
  
      <div className="Register-container">
        <h2>Register as a Service Provider</h2>
        <p className="sub-topic">Fill out the form below to list your services.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name <span className="text-danger">*</span></label>
            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email <span className="text-danger">*</span></label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone Number <span className="text-danger">*</span></label>
            <input type="tel" className="form-control" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Service Area <span className="text-danger">*</span></label>
            <input type="text" className="form-control" value={serviceArea} onChange={(e) => setServiceArea(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Service Type <span className="text-danger">*</span></label>
            <select
              className="form-control"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              required
            >
              <option value="" disabled>Select a service type</option>
              <option value="Plumber">Plumber</option>
              <option value="Electrician">Electrician</option>
              <option value="Laundry">Laundry</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Pest Control">Pest Control</option>
              <option value="Mechanic">Mechanic</option>
              <option value="Painter">Painter</option>
              <option value="Mason">Mason</option>
              <option value="Other">Courier</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="4" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
          </div>
          <button type="submit" className="Loginbtn btn-primary w-100">Register</button>
        </form>
      </div>
    </>
  );
}

export default RegisterServiceProvider;