import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import '../Componets/CSS/Bookroom.css';
import logo from "../Componets/assets/unistaylogo.png";

function BookRoomPage() {
  const location = useLocation();
  const { room } = location.state || {};
  const navigate = useNavigate();
  const [paymentOption, setPaymentOption] = useState("physical");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handlePaymentOptionChange = (e) => {
    setPaymentOption(e.target.value);
  };

  const handleAgreeToTermsChange = (e) => {
    setAgreeToTerms(e.target.checked);
  };

  const handleThumbnailClick = (index) => {
    setActiveImageIndex(index);
  };

  const handleConfirmBooking = () => {
    navigate("/Bookroomform", { state: { room, paymentOption } });
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  if (!room) {
    return (
      <div className="br-empty-state">
        <div className="br-empty-card">
          <div className="br-empty-icon">!</div>
          <h3>Room not found</h3>
          <p>Room details are not available. Please go back and select a room.</p>
          <button className="br-btn-primary" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  const getOwnerInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <div className="LOGO-container">
            <a className="nav-link" href="/">
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
                <a className="nav-link" href="/Userroom">About Us</a>
              </li>

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
                  {sessionStorage.getItem("token") && (
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}><strong>Logout</strong></button>
                    </li>
                  )}
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="br-page">

        {/* Hero Banner */}
        <div className="br-hero">
          <div className="br-hero-left">
            <span className="br-hero-badge">Student Housing</span>
            <h1 className="br-hero-title">
              {room.roomType} for Rent
              <span className="br-hero-city"> — {room.roomCity}</span>
            </h1>
            <p className="br-hero-sub">
              Listed on {new Date(room.createdAt).toLocaleDateString("en-LK", {
                day: "numeric", month: "long", year: "numeric"
              })}
            </p>
          </div>
          <div className="br-hero-right">
            <div className="br-hero-price-label">Monthly rent</div>
            <div className="br-hero-price">Rs. {room.price.toLocaleString()}</div>
            <div className="br-hero-per">per month</div>
            <div className={`br-nego-chip ${room.isNegotiable ? "yes" : "no"}`}>
              <span className="br-nego-dot"></span>
              {room.isNegotiable ? "Negotiable" : "Fixed Price"}
            </div>
          </div>
        </div>

        {/* Two Column Grid */}
        <div className="br-grid">

          {/* Left Column */}
          <div className="br-col-left">

            {/* Image Panel */}
            <div className="br-panel">
              <div className="br-main-img-wrap">
                <img
                  src={`http://localhost:8070${room.images[activeImageIndex]}`}
                  alt={`Room view ${activeImageIndex + 1}`}
                  className="br-main-img"
                />
              </div>
              {room.images.length > 1 && (
                <div className="br-thumbs">
                  {room.images.map((image, index) => (
                    <img
                      key={index}
                      src={`http://localhost:8070${image}`}
                      alt={`Thumbnail ${index + 1}`}
                      className={`br-thumb ${index === activeImageIndex ? "active" : ""}`}
                      onClick={() => handleThumbnailClick(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Details Panel */}
            <div className="br-panel">
              <div className="br-panel-section">
                <div className="br-section-label">Room details</div>
                <div className="br-detail-grid">
                  <div className="br-detail-row">
                    <span className="br-detail-key">Room type</span>
                    <strong className="br-detail-val">{room.roomType}</strong>
                  </div>
                  <div className="br-detail-row">
                    <span className="br-detail-key">City</span>
                    <strong className="br-detail-val">{room.roomCity}</strong>
                  </div>
                  <div className="br-detail-row">
                    <span className="br-detail-key">Owner</span>
                    <strong className="br-detail-val">{room.ownerName}</strong>
                  </div>
                  <div className="br-detail-row">
                    <span className="br-detail-key">Negotiable</span>
                    <strong className="br-detail-val">{room.isNegotiable ? "Yes" : "No"}</strong>
                  </div>
                  <div className="br-detail-row">
                    <span className="br-detail-key">Listed on</span>
                    <strong className="br-detail-val">
                      {new Date(room.createdAt).toLocaleString("en-LK", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </strong>
                  </div>
                </div>

                <div className="br-section-label" style={{ marginTop: "1.4rem" }}>Description</div>
                <div className="br-description-box">{room.description}</div>
              </div>
            </div>

          </div>

          {/* Right Column — Booking Sidebar */}
          <div className="br-col-right">

            <div className="br-panel br-booking-panel">

              {/* Price */}
              <div className="br-booking-section">
                <div className="br-booking-section-label">Monthly rent</div>
                <div className="br-price-display">
                  Rs. {room.price.toLocaleString()}
                  <span className="br-price-mo"> / month</span>
                </div>
              </div>

              <div className="br-booking-divider"></div>

              {/* Owner Card */}
              <div className="br-owner-card">
                <div className="br-owner-avatar">{getOwnerInitials(room.ownerName)}</div>
                <div>
                  <div className="br-owner-name">{room.ownerName}</div>
                  <div className="br-owner-role">Property Owner</div>
                </div>
              </div>

              <div className="br-booking-divider"></div>

              {/* Payment Option */}
              <div className="br-booking-section">
                <div className="br-booking-section-label">Payment method</div>
                <label className="br-pay-option">
                  <div className="br-radio-circle">
                    <div className="br-radio-dot"></div>
                  </div>
                  <input
                    type="radio"
                    name="paymentOption"
                    value="physical"
                    checked={paymentOption === "physical"}
                    onChange={handlePaymentOptionChange}
                    style={{ display: "none" }}
                  />
                  <div>
                    <div className="br-pay-label">Pay after physical visit</div>
                    <div className="br-pay-sub">Visit the room first, then pay in person</div>
                  </div>
                </label>
              </div>

              {paymentOption === "physical" && (
                <div className="br-info-box">
                  We kindly request you to visit the room before making any payment to ensure it meets your requirements.
                </div>
              )}

              <div className="br-booking-divider"></div>

              {/* Terms */}
              <label className="br-terms-row">
                <div className={`br-checkbox ${agreeToTerms ? "checked" : ""}`}>
                  {agreeToTerms && <span className="br-checkmark">✓</span>}
                </div>
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={handleAgreeToTermsChange}
                  style={{ display: "none" }}
                />
                <div className="br-terms-text">
                  I agree to the{" "}
                  <a href="/Terms" onClick={e => e.stopPropagation()}>Terms and Conditions</a>{" "}
                  before proceeding with the booking.
                </div>
              </label>

              {/* CTA Button */}
              <button
                className="br-btn-primary"
                disabled={!agreeToTerms}
                onClick={handleConfirmBooking}
              >
                Add to Favourites
              </button>

            </div>

            {/* Help Panel */}
            <div className="br-panel br-help-panel">
              <div className="br-section-label">Need help?</div>
              <p className="br-help-text">
                You can contact the property owner directly after saving this listing. Our support team is available Mon–Sat, 9am–5pm.
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default BookRoomPage;
