import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Navigation hooksr-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Componets/CSS/ServiceProviderDetails.css";
import logo from "../Componets/assets/unistaylogo.png";

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


function ServiceProviderDetails() {
  const { state } = useLocation(); // Get the state passed via navigation
  const provider = state?.provider; // Access the provider object from state
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

  // State for reviews and form inputs
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Load reviews from localStorage on component mount
  useEffect(() => {
    if (provider) {
      const storedReviews = JSON.parse(localStorage.getItem(`reviews_${provider._id}`) || "[]");
      setReviews(storedReviews);
    }
  }, [provider]);

  const handleSave = () => {
    const savedProviders = JSON.parse(localStorage.getItem(`savedProviders_${currentUser}`) || "[]");
    if (!savedProviders.some(p => p._id === provider._id)) {
      savedProviders.push(provider);
      localStorage.setItem(`savedProviders_${currentUser}`, JSON.stringify(savedProviders));
      alert("Provider saved successfully!");
    } else {
      alert("This provider is already saved!");
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5 || !comment.trim()) {
      alert("Please provide a rating (1-5) and a comment.");
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
    localStorage.setItem(`reviews_${provider._id}`, JSON.stringify(updatedReviews));
    alert("Review submitted successfully!");

    // Reset form
    setRating(0);
    setComment("");
  };

  if (!provider) {
    return null; // Redirect handled in routing if no provider
  }

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "No reviews yet";

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
    <div className="details-container">
      <div className="provider-details-card">
        {/* Main Image */}
        <div className="main-image">
          <img
            src={serviceTypeImages[provider.serviceType] || "https://via.placeholder.com/600x300?text=No+Image"}
            alt={`${provider.name} Main Image`}
          />
        </div>
        
        {/* Provider Name and Location */}
        <div className="header-section">
          <h2 className="provider-name">{provider.name}</h2>
          <p className="location">{provider.serviceArea}</p>
        </div>
        
        {/* Description and Other Details */}
        <div className="details-section">
          <span className="service-type">{provider.serviceType}</span>
          
          <p className="provider-description">
            {provider.description || "No description available"}
          </p>
          
          <div className="contact-info">
            <span className="contact-item">
              <i className="fas fa-phone"></i> {provider.phoneNumber}
            </span>
            <span className="contact-item">
              <i className="fas fa-envelope"></i> {provider.email}
            </span>
            <span className="contact-item">
              <i className="fas fa-calendar"></i> Joined {new Date(provider.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="provider-status">
            <span className="badge bg-success">{provider.status}</span>
          </div>
          
          <button className="save-btn" onClick={handleSave}>
            Save Provider
          </button>
        </div>
        
        {/* Reviews Section */}
        <div className="reviews-section">
          <h3>Reviews ({reviews.length})</h3>
          
          <div className="average-rating">
            <span className="rating-score">{averageRating}</span>
            <span className="rating-stars">
              {[...Array(5)].map((_, index) => (
                <span key={index} className={index < Math.round(averageRating) ? "star filled" : "star"}>
                  ★
                </span>
              ))}
            </span>
            <span className="rating-count">({reviews.length} reviews)</span>
          </div>
          
          {/* Review Form */}
          <div className="review-form">
            <h4>Write a Review</h4>
            <div className="rating-input">
              <label>Rating: </label>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= rating ? "star filled" : "star"}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              className="form-control mt-2"
              rows="3"
              placeholder="Write your review here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="btn" onClick={handleSubmitReview}>
              Submit Review
            </button>
          </div>
          
          {/* Existing Reviews */}
          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div className="review-item" key={index}>
                  <div className="review-header">
                    <span className="review-user">{review.user}</span>
                    <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? "star filled" : "star"}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="no-reviews">No reviews yet. Be the first to write one!</p>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default ServiceProviderDetails;