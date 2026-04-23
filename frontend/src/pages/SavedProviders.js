import React, { useState, useEffect } from "react";
import {  useNavigate } from "react-router-dom"; // Navigation hooksr-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Componets/CSS/SavedProviders.css";
import AppHeader from "../Componets/AppHeader";

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
      <AppHeader
        appName="Bird Nest"
        tagline="Find Your Perfect Space"
        showLogout={!!sessionStorage.getItem("token")}
        onLogout={handleLogout}
      />

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