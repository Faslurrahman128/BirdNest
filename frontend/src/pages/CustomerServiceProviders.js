import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Componets/CSS/CustomerServiceProvider.css";
import "../Componets/CSS/AddRoom.css";
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


function CustomerServiceProviders() {
  const [verifiedProviders, setVerifiedProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [searchArea, setSearchArea] = useState("");
  const [searchType, setSearchType] = useState("Select Property Type");
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

  // Define available service types for the dropdown
  const serviceTypes = [
    "Select Property Type",
    "Plumber",
    "Electrician",
    "Laundry",
    "Cleaning",
    "Pest Control",
    "Mechanic",
    "Painter",
    "Mason",
    "Other",
  ];

  useEffect(() => {
    fetchVerifiedProviders();
  }, []);

  const fetchVerifiedProviders = async () => {
    try {
      const response = await axios.get("http://localhost:8070/ServiceProvider/verified");
      const providersWithReviews = response.data.map(provider => {
        const storedReviews = JSON.parse(localStorage.getItem(`reviews_${provider._id}`) || "[]");
        const averageRating = storedReviews.length > 0
          ? (storedReviews.reduce((sum, review) => sum + review.rating, 0) / storedReviews.length).toFixed(1)
          : "0.0";
        return { ...provider, reviews: storedReviews, averageRating };
      });
      setVerifiedProviders(providersWithReviews);
      setFilteredProviders(providersWithReviews);
    } catch (error) {
      console.error("Error fetching verified providers", error);
      alert("Failed to load verified service providers.");
    }
  };

  const handleSearch = () => {
    let filtered = verifiedProviders;

    if (searchArea) {
      filtered = filtered.filter((provider) =>
        provider.serviceArea.toLowerCase().includes(searchArea.toLowerCase())
      );
    }

    if (searchType !== "Select Property Type") {
      filtered = filtered.filter((provider) =>
        provider.serviceType.toLowerCase() === searchType.toLowerCase()
      );
    }

    setFilteredProviders(filtered);
  };

  const handleCardClick = (provider) => {
    navigate(`/service-providers-details`, { state: { provider } });
  };

  // Function to render star ratings
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={`star ${index < Math.round(rating) ? "filled" : ""}`}
      >
        ★
      </span>
    ));
  };

   // Logout function
   const handleLogout = () => {
    // Remove token fromsessionStorage
  sessionStorage.removeItem("token");
    // Redirect to login page
    navigate("/login", { replace: true });
  };

   const navLinks = [
    { label: "🏠 Dashboard",    href: "/Dash" },
    { label: "📋 Post Add",     href: "/AddRoom" },
    { label: "🏘️ Properties",   href: "/RoomList" },
    { label: "🔧 Services",     href: "/service-providers", active: true },
    { label: "ℹ️ About Us",     href: "/AboutUS" },
  ];

  const accountLinks = [
    { label: "👤 View Profile",      href: "/profile" },
    { label: "🛏️ My Room",          href: "/MyRoom" },
    { label: "📋 My Listings",       href: "/MyListings" },
    { label: "🎟️ Add a Ticket",      href: "/Ticket" },
    { label: "🔑 Service Provider",  href: "/register-service-provider" },
    { label: "🔖 My Bookmarks",      href: "/saved-providers" },
  ];

  return (
    <div className="listings-body">
      <AppHeader
        appName="Bird Nest"
        tagline="Find Your Perfect Space"
        showLogout={!!sessionStorage.getItem("token")}
        onLogout={handleLogout}
      />

      <div className="addroom-layout">
        {/* ── Sidebar ── */}
        <aside className="addroom-sidebar">
          <p className="sidebar-section-label">Navigation</p>
          <nav className="sidebar-nav">
            {navLinks.map(({ label, href, active }) => (
              <Link
                key={href}
                to={href}
                className={`sidebar-link${active ? " sidebar-link--active" : ""}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <p className="sidebar-section-label" style={{ marginTop: "28px" }}>Account</p>
          <nav className="sidebar-nav">
            {accountLinks.map(({ label, href }) => (
              <Link key={href} to={href} className="sidebar-link">
                {label}
              </Link>
            ))}
            {sessionStorage.getItem("token") && (
              <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
                🚪 Logout
              </button>
            )}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <div className="Postadd-container-body" style={{ flex: 1, minWidth: 0 }}>

    <div className="customer-service-container">
      <div className="content-wrapper">
        {/* Search Bar */}
        <div className="search-bar-container">
          <h1 className="search-heading">Find Service Providers</h1>
          <div className="search-bar-row">
            <div className="search-field">
              <label>Service Area</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Service Area (e.g., Kataragama)"
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
              />
            </div>
            <div className="search-field">
              <label>Service Type</label>
              <select
                className="form-select"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                {serviceTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="search-button">
              <button className="btn search-btn" onClick={handleSearch}>
                <span className="search-text">Search</span>
              </button>
            </div>
          </div>
        </div>

        {/* Service Providers List */}
        <div className="service-providers-list">
          <div className="list-header">
            <h2>Verified Service Providers</h2>
            <span className="results-count">{filteredProviders.length} found</span>
          </div>
          
          {filteredProviders.length > 0 ? (
            <div className="providers-grid">
              {filteredProviders.map((provider) => (
                <div
                  className="provider-card"
                  key={provider._id}
                  onClick={() => handleCardClick(provider)}
                >
                  <div className="provider-card-inner">
                    <div className="provider-image">
                      <img
                        src={serviceTypeImages[provider.serviceType] || "https://via.placeholder.com/150?text=No+Image"}
                        alt={`${provider.serviceType} Service`}
                      />
                      <div className="service-type-badge">{provider.serviceType}</div>
                    </div>
                    <div className="provider-details">
                      <div className="provider-header">
                        <h3 className="provider-name">{provider.name}</h3>
                        <div className="provider-rating">
                          <span className="rating-score">{provider.averageRating}</span>
                          <div className="rating-stars">
                            {renderStars(provider.averageRating)}
                          </div>
                          <span className="rating-count">({provider.reviews.length})</span>
                        </div>
                      </div>
                      <p className="provider-location">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="location-icon" viewBox="0 0 16 16">
                          <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                        </svg>
                        {provider.serviceArea}
                      </p>
                      <p className="provider-description">{provider.description || "No description available"}</p>
                      <div className="provider-contact">
                        <div className="contact-item">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="contact-icon" viewBox="0 0 16 16">
                            <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                          </svg>
                          {provider.phoneNumber}
                        </div>
                        <div className="contact-item">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="contact-icon" viewBox="0 0 16 16">
                            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                          </svg>
                          {provider.email}
                        </div>
                      </div>
                      <button className="view-details-btn">View Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm-2.715 5.933a.5.5 0 0 1-.183-.683A4.498 4.498 0 0 1 8 9.5a4.5 4.5 0 0 1 3.898 2.25.5.5 0 0 1-.866.5A3.498 3.498 0 0 0 8 10.5a3.498 3.498 0 0 0-3.032 1.75.5.5 0 0 1-.683.183zM10 8c-.552 0-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5S10.552 8 10 8z"/>
              </svg>
              <p>No verified service providers found matching your criteria.</p>
              <button className="reset-search-btn" onClick={() => {
                setSearchArea("");
                setSearchType("Select Property Type");
                setFilteredProviders(verifiedProviders);
              }}>Reset Search</button>
            </div>
          )}
        </div>
      </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default CustomerServiceProviders;