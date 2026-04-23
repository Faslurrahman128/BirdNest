import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../Componets/CSS/RegisterServiceProvider.css';
import AppHeader from "../Componets/AppHeader";

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
      <AppHeader
        appName="Bird Nest"
        tagline="Find Your Perfect Space"
        showLogout={!!sessionStorage.getItem("token")}
        onLogout={handleLogout}
      />
  
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