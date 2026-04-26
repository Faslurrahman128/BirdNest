import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../Componets/CSS/RegisterServiceProvider.css';
import AppHeader from "../Componets/AppHeader";
import logo from "../Componets/assets/APPLOGO.png";

function RegisterServiceProvider() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nicNumber, setNicNumber] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");

  // Image states
  const [nicFront, setNicFront] = useState(null);
  const [nicBack, setNicBack] = useState(null);
  const [nicFrontPreview, setNicFrontPreview] = useState(null);
  const [nicBackPreview, setNicBackPreview] = useState(null);

  const navigate = useNavigate();

  const handleImageChange = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }
      if (side === "front") {
        setNicFront(file);
        setNicFrontPreview(URL.createObjectURL(file));
      } else {
        setNicBack(file);
        setNicBackPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to register as a service provider.");
      return;
    }

    if (!name || !email || !phoneNumber || !nicNumber || !yearsOfExperience ||
        !serviceArea || !serviceType || !nicFront || !nicBack) {
      alert("Please fill out all required fields and upload both NIC front & back images.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phoneNumber", phoneNumber);
    formData.append("nicNumber", nicNumber);
    formData.append("yearsOfExperience", parseInt(yearsOfExperience));
    formData.append("serviceArea", serviceArea);
    formData.append("serviceType", serviceType);
    formData.append("description", description);
    formData.append("nicFront", nicFront);
    formData.append("nicBack", nicBack);

    try {
      const response = await axios.post(
        "http://localhost:8070/ServiceProvider/register",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      alert(response.data.message || "Registration successful!");
      navigate("/dash");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Error registering. Please try again later.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
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

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-3">
            <label className="form-label">Full Name <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email <span className="text-danger">*</span></label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone Number <span className="text-danger">*</span></label>
            <input
              type="tel"
              className="form-control"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">NIC Number <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              value={nicNumber}
              onChange={(e) => setNicNumber(e.target.value)}
              placeholder="e.g. 123456789V"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Years of Experience <span className="text-danger">*</span></label>
            <input
              type="number"
              className="form-control"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              min="0"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Service Area <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              required
            />
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
              <option value="Courier">Courier</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* NIC Image Uploads */}
          <div className="mb-4">
            <label className="form-label">NIC Card Images <span className="text-danger">*</span></label>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Front Side of NIC <span className="text-danger">*</span></label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "front")}
                  required
                />
                {nicFrontPreview && (
                  <div className="mt-2">
                    <img
                      src={nicFrontPreview}
                      alt="NIC Front Preview"
                      className="img-thumbnail"
                      style={{ maxHeight: "150px" }}
                    />
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Back Side of NIC <span className="text-danger">*</span></label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "back")}
                  required
                />
                {nicBackPreview && (
                  <div className="mt-2">
                    <img
                      src={nicBackPreview}
                      alt="NIC Back Preview"
                      className="img-thumbnail"
                      style={{ maxHeight: "150px" }}
                    />
                  </div>
                )}
              </div>
            </div>
            <small className="text-muted">
              Please upload clear images of both sides of your NIC card (Max 5MB each)
            </small>
          </div>

          <div className="mb-3">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-control"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <button type="submit" className="Loginbtn btn-primary w-100">
            Register as Service Provider
          </button>
        </form>
      </div>
    </>
  );
}

export default RegisterServiceProvider;