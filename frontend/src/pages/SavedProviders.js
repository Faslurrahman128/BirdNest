import React, { useState, useEffect } from "react";
import {  useNavigate } from "react-router-dom"; // Navigation hooksr-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Componets/CSS/SavedProviders.css";

// Import images for each service type
import plumberImg from "../Componets/assets/plumber.jpg";
import electricianImg from "../Componets/assets/electric.jpg";
import laundryImg from "../Componets/assets/laundry.jpg";
import cleaningImg from "../Componets/assets/clean.jpg";
import pestControlImg from "../Componets/assets/pest.jpg";
import mechanicImg from "../Componets/assets/mechanic.jpg";
import painterImg from "../Componets/assets/painter.jpg";
import masonImg from "../Componets/assets/mason.jpg";
import otherImg from "../Componets/assets/courier.jpg";
import logo from "../Componets/assets/unistaylogo.png";

function SavedProviders() {
  const [savedProviders, setSavedProviders] = useState([]);
  const navigate = useNavigate();

  // Image mapping for each service type
  const serviceTypeImages = {
    Plumber: plumberImg,
    Electrician: electricianImg,
    Laundry: laundryImg,
    Cleaning: cleaningImg,
    "Pest Control": pestControlImg,
    Mechanic: mechanicImg,
    Painter: painterImg,
    Mason: masonImg,
    Other: otherImg,
  };

  // Placeholder for current logged-in user (replace with your auth logic)
  const currentUser = "user123"; // Example user ID

  useEffect(() => {
    const storedProviders = JSON.parse(localStorage.getItem(`savedProviders_${currentUser}`) || "[]");
    setSavedProviders(storedProviders);
  }, []);

  const handleRemove = (providerId) => {
    const updatedProviders = savedProviders.filter((provider) => provider._id !== providerId);
    setSavedProviders(updatedProviders);
    localStorage.setItem(`savedProviders_${currentUser}`, JSON.stringify(updatedProviders));
    alert("Provider removed from saved list!");
  };

  const handleCardClick = (provider) => {
    navigate("/service-providers-details", { state: { provider } });
  };

  
         // Logout function
         const handleLogout = () => {
          // Remove token fromsessionStorage
        sessionStorage.removeItem("token");
          // Redirect to login page
          navigate("/login", { replace: true });
        };

  return (

    <>
              
        
              {/* Navbar */}
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
                        <a className="nav-link" href="/service-providers">Services</a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="/AboutUs">About Us</a>
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
              </nav>

    <div className="saved-container">
      <h2>Saved Providers</h2>
      
      {savedProviders.length > 0 ? (
        savedProviders.map((provider) => (
          <div
            className="saved-card"
            key={provider._id}
            onClick={() => handleCardClick(provider)}
            style={{ cursor: "pointer" }}
          >
            <div className="saved-image">
              <img
                src={serviceTypeImages[provider.serviceType] || "https://via.placeholder.com/150?text=No+Image"}
                alt={`${provider.name} Image`}
              />
            </div>
            
            <div className="saved-details">
              <h5>{provider.name}</h5>
              <p className="service-area">{provider.serviceArea}</p>
              <span className="service-type-tag">{provider.serviceType}</span>
              
              <p className="description-text">
                {provider.description || "No description available"}
              </p>
              
              <div className="contact-info">
                <span><i className="fas fa-phone"></i> {provider.phoneNumber}</span>
                <span><i className="fas fa-envelope"></i> {provider.email}</span>
              </div>
              
              <p className="provider-date">
                <i className="fas fa-calendar"></i> Joined {new Date(provider.createdAt).toLocaleDateString()}
              </p>
              
              <div className="provider-status">
                <span className="badge bg-success">{provider.status}</span>
              </div>
            </div>
            
            <div className="saved-actions">
              <button
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click event
                  handleRemove(provider._id);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="no-providers">
          <p>You haven't saved any service providers yet.</p>
        </div>
      )}
      
      <button className="back-btn" onClick={() => navigate("/service-providers")}>
        Back to Providers
      </button>
    </div>
    </>
  );
}

export default SavedProviders;