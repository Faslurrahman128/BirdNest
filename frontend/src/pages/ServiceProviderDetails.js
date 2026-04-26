import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Componets/CSS/ServiceProviderDetails.css";
import logo from "../Componets/assets/APPLOGO.png";

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

const StarRow = ({ rating, max = 5, clickable = false, onRate }) => (
  <div className="spd-stars">
    {[...Array(max)].map((_, i) => (
      <span
        key={i}
        className={`spd-star${i < rating ? " filled" : ""}${clickable ? " clickable" : ""}`}
        onClick={() => clickable && onRate && onRate(i + 1)}
      >
        ★
      </span>
    ))}
  </div>
);

function ServiceProviderDetails() {
  const { state } = useLocation();
  const provider = state?.provider;
  const navigate = useNavigate();
  const currentUser = "user123";

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

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    problem: "",
    preferredDate: "",
    preferredTime: "",
  });
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (provider) {
      const storedReviews = JSON.parse(
        localStorage.getItem(`reviews_${provider._id}`) || "[]"
      );
      setReviews(storedReviews);
      const savedProviders = JSON.parse(
        localStorage.getItem(`savedProviders_${currentUser}`) || "[]"
      );
      setSaved(savedProviders.some((p) => p._id === provider._id));
    }
  }, [provider]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!provider) return;
    const savedProviders = JSON.parse(
      localStorage.getItem(`savedProviders_${currentUser}`) || "[]"
    );
    if (!savedProviders.some((p) => p._id === provider._id)) {
      savedProviders.push(provider);
      localStorage.setItem(
        `savedProviders_${currentUser}`,
        JSON.stringify(savedProviders)
      );
      setSaved(true);
    }
  };

  const handleSubmitReview = () => {
    if (rating < 1 || !comment.trim()) {
      alert("Please provide a rating and a comment.");
      return;
    }
    const newReview = {
      user: currentUser,
      rating,
      comment,
      date: new Date().toISOString(),
    };
    const updatedReviews = [...reviews, newReview];
    setReviews(updatedReviews);
    localStorage.setItem(
      `reviews_${provider._id}`,
      JSON.stringify(updatedReviews)
    );
    setRating(0);
    setComment("");
  };

  // Logout function
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const handleWhatsAppContact = () => {
    const { name, phone, address, problem, preferredDate, preferredTime } =
      formData;

    if (
      !name.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !problem.trim()
    ) {
      alert(
        "Please fill in all required fields: Name, Phone, Address, and Problem description."
      );
      return;
    }

    const message =
      `Hello ${provider?.name || "Service Provider"},\n\n` +
      `I would like to request your service.\n\n` +
      `👤 Name: ${name}\n` +
      `📞 Phone: ${phone}\n` +
      `📍 Address: ${address}\n` +
      `🔧 Service Needed: ${problem}\n` +
      `📅 Preferred Date: ${preferredDate || "Flexible"}\n` +
      `⏰ Preferred Time: ${preferredTime || "Flexible"}\n\n` +
      `Please reply with your availability. Thank you!`;

    let rawNumber = provider.phoneNumber.replace(/\D/g, "");
    if (rawNumber.startsWith("0")) {
      rawNumber = "94" + rawNumber.slice(1);
    } else if (!rawNumber.startsWith("94") && rawNumber.length <= 9) {
      rawNumber = "94" + rawNumber;
    }

    const whatsappUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  if (!provider) {
    return (
      <div className="spd-page" style={{ padding: "80px 72px" }}>
        No provider information found.
      </div>
    );
  }

  return (
    <>
      {/* ── ORIGINAL NAVBAR (unchanged) ── */}
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
                  <li>
                    <a className="dropdown-item" href="/profile">View Profile</a>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <a className="dropdown-item" href="/MyRoom">My Room</a>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <a className="dropdown-item" href="/MyListings">My Listings</a>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <a className="dropdown-item" href="/register-service-provider">
                      Service Provider
                    </a>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <a className="dropdown-item" href="/saved-providers">Bookmarks</a>
                  </li>
                  {sessionStorage.getItem("token") && (
                    <>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item" onClick={handleLogout}>
                          <strong>Logout</strong>
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* ── NEW MIDDLE CONTENT ── */}
      <div className="spd-page">

        {/* ── FULL-WIDTH HERO ── */}
        <div className="spd-hero">
          <img
            src={
              serviceTypeImages[provider.serviceType] ||
              "https://placehold.co/1400x520?text=No+Image"
            }
            alt={provider.name}
          />
          <div className="spd-hero-overlay" />
          <div className="spd-hero-content">
            <div className="spd-hero-badge">⚡ {provider.serviceType}</div>
            <div className="spd-hero-name">
              {provider.name}
              {provider.status === "verified" && (
                <span className="spd-verified-pill">✓ Verified</span>
              )}
            </div>
            <div className="spd-hero-location">📍 {provider.serviceArea}</div>
          </div>
        </div>

        {/* ── STAT BAR ── */}
        <div className="spd-stat-bar">
          <div className="spd-stat-bar-inner">
            <div className="spd-stat">
              <div className="spd-stat-icon">🔧</div>
              <div>
                <div className="spd-stat-label">Service Type</div>
                <div className="spd-stat-value">{provider.serviceType}</div>
              </div>
            </div>
            <div className="spd-stat">
              <div className="spd-stat-icon">📍</div>
              <div>
                <div className="spd-stat-label">Service Area</div>
                <div className="spd-stat-value">{provider.serviceArea}</div>
              </div>
            </div>
            <div className="spd-stat">
              <div className="spd-stat-icon">🏅</div>
              <div>
                <div className="spd-stat-label">Experience</div>
                <div className="spd-stat-value">
                  {provider.yearsOfExperience} Years
                </div>
              </div>
            </div>
            <div className="spd-stat">
              <div className="spd-stat-icon">⭐</div>
              <div>
                <div className="spd-stat-label">Rating</div>
                <div className="spd-stat-value">
                  {reviews.length > 0
                    ? `${averageRating.toFixed(1)} / 5`
                    : "No reviews yet"}
                </div>
              </div>
            </div>
            <div className="spd-stat">
              <div className="spd-stat-icon">📅</div>
              <div>
                <div className="spd-stat-label">Member Since</div>
                <div className="spd-stat-value">
                  {new Date(provider.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT ZONE ── */}
        <div className="spd-content-zone">
          <div className="spd-body">

            {/* ── LEFT COLUMN ── */}
            <div>

              {/* About */}
              <div className="spd-card">
                <div className="spd-card-title">
                  <div className="spd-card-title-icon">📋</div>
                  About This Provider
                </div>
                <p className="spd-description">
                  {provider.description ||
                    "No description provided by this service provider."}
                </p>
              </div>

              {/* Contact */}
              <div className="spd-card">
                <div className="spd-card-title">
                  <div className="spd-card-title-icon">📬</div>
                  Contact Information
                </div>
                <div className="spd-contact-row">
                  <div className="spd-contact-icon">📞</div>
                  <div>
                    <div className="spd-contact-label">Phone</div>
                    <div className="spd-contact-value">{provider.phoneNumber}</div>
                  </div>
                </div>
                <div className="spd-contact-row">
                  <div className="spd-contact-icon">✉️</div>
                  <div>
                    <div className="spd-contact-label">Email</div>
                    <div className="spd-contact-value">{provider.email}</div>
                  </div>
                </div>
                <div className="spd-contact-row">
                  <div className="spd-contact-icon">🪪</div>
                  <div>
                    <div className="spd-contact-label">NIC Number</div>
                    <div className="spd-contact-value">
                      {provider.nicNumber || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Form */}
              <div className="spd-card">
                <div className="spd-card-title">
                  <div className="spd-card-title-icon">📝</div>
                  Request This Service
                </div>
                <div className="spd-form-grid">
                  <div className="spd-form-group">
                    <label className="spd-form-label">Your Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="spd-input"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="spd-form-group">
                    <label className="spd-form-label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      className="spd-input"
                      placeholder="077 123 4567"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="spd-form-group spd-form-full">
                    <label className="spd-form-label">Full Address *</label>
                    <textarea
                      name="address"
                      className="spd-input spd-textarea-field"
                      rows={2}
                      placeholder="House No, Street, Area, City"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="spd-form-group spd-form-full">
                    <label className="spd-form-label">
                      Describe the Problem / Service Needed *
                    </label>
                    <textarea
                      name="problem"
                      className="spd-input spd-textarea-field"
                      rows={4}
                      placeholder="Example: Kitchen sink leaking from below, need urgent repair..."
                      value={formData.problem}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="spd-form-group">
                    <label className="spd-form-label">Preferred Date</label>
                    <input
                      type="date"
                      name="preferredDate"
                      className="spd-input"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="spd-form-group">
                    <label className="spd-form-label">Preferred Time</label>
                    <input
                      type="time"
                      name="preferredTime"
                      className="spd-input"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <button className="spd-whatsapp-btn" onClick={handleWhatsAppContact}>
                  💬 Contact via WhatsApp
                </button>
              </div>

              {/* Reviews */}
              <div className="spd-card">
                <div className="spd-card-title">
                  <div className="spd-card-title-icon">⭐</div>
                  Reviews &amp; Ratings
                </div>

                <div className="spd-rating-summary">
                  <div className="spd-rating-big">
                    {reviews.length > 0 ? averageRating.toFixed(1) : "—"}
                  </div>
                  <div>
                    <StarRow rating={Math.round(averageRating)} />
                    <div className="spd-rating-sub">
                      {reviews.length}{" "}
                      {reviews.length === 1 ? "review" : "reviews"}
                    </div>
                  </div>
                </div>

                <div className="spd-review-form">
                  <div className="spd-section-label">Write a Review</div>
                  <label className="spd-form-label">Your Rating</label>
                  <StarRow rating={rating} clickable onRate={setRating} />
                  <textarea
                    className="spd-input spd-textarea-field"
                    rows={3}
                    placeholder="Share your experience with this provider..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ marginTop: "14px" }}
                  />
                  <button className="spd-submit-btn" onClick={handleSubmitReview}>
                    Submit Review
                  </button>
                </div>

                <div>
                  {reviews.length > 0 ? (
                    reviews.map((review, i) => (
                      <div className="spd-review-item" key={i}>
                        <div className="spd-review-header">
                          <div className="spd-reviewer-info">
                            <div className="spd-reviewer-avatar">
                              {review.user[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="spd-reviewer-name">
                                {review.user}
                              </div>
                              <StarRow rating={review.rating} />
                            </div>
                          </div>
                          <div className="spd-review-date">
                            {new Date(review.date).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="spd-review-comment">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="spd-no-reviews">
                      No reviews yet — be the first!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── SIDEBAR ── */}
            <div className="spd-sidebar">

              {/* Quick contact card */}
              <div className="spd-quick-contact">
                <div className="spd-quick-contact-title">Quick Contact</div>
                <div className="spd-quick-contact-sub">
                  Reach out directly to this provider
                </div>
                <div className="spd-quick-contact-detail">
                  <span className="spd-quick-contact-icon">📞</span>
                  <span>{provider.phoneNumber}</span>
                </div>
                <div className="spd-quick-contact-detail">
                  <span className="spd-quick-contact-icon">✉️</span>
                  <span>{provider.email}</span>
                </div>
              </div>

              {/* Provider details card */}
              <div className="spd-card">
                <button
                  className="spd-save-btn"
                  onClick={handleSave}
                  disabled={saved}
                >
                  {saved ? "✓ Saved" : "🔖 Save Provider"}
                </button>

                <div
                  className="spd-section-label"
                  style={{ marginTop: "4px" }}
                >
                  Provider Details
                </div>

                <div className="spd-meta-item">
                  <span className="spd-meta-label">Service</span>
                  <span className="spd-meta-value">{provider.serviceType}</span>
                </div>
                <div className="spd-meta-item">
                  <span className="spd-meta-label">Area</span>
                  <span className="spd-meta-value">{provider.serviceArea}</span>
                </div>
                <div className="spd-meta-item">
                  <span className="spd-meta-label">Experience</span>
                  <span className="spd-meta-value">
                    {provider.yearsOfExperience} yrs
                  </span>
                </div>
                <div className="spd-meta-item">
                  <span className="spd-meta-label">Status</span>
                  <span
                    className="spd-meta-value"
                    style={{
                      color:
                        provider.status === "verified" ? "#1a7a45" : "#b45309",
                    }}
                  >
                    {provider.status === "verified" ? "✓ Verified" : "Pending"}
                  </span>
                </div>
                <div className="spd-meta-item">
                  <span className="spd-meta-label">Rating</span>
                  <span className="spd-meta-value">
                    {reviews.length > 0
                      ? `${averageRating.toFixed(1)} / 5`
                      : "N/A"}
                  </span>
                </div>
                <div className="spd-meta-item">
                  <span className="spd-meta-label">Reviews</span>
                  <span className="spd-meta-value">{reviews.length}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ServiceProviderDetails;