import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigat
import "bootstrap/dist/css/bootstrap.min.css";
import '../Componets/CSS/Bookroom.css'; // Ensure the CSS is linked here
import logo from "../Componets/assets/unistaylogo.png";
import { FaCommentDots } from "react-icons/fa";

function BookRoomPage() {
  const location = useLocation();
  const { room } = location.state || {}; // Get room details from navigation state
  const navigate = useNavigate(); // Initialize useNavigate
  const [paymentOption, setPaymentOption] = useState("physical"); // Default to physical payment
  const [agreeToTerms, setAgreeToTerms] = useState(false); // Track if user agrees to terms
  const [activeImageIndex, setActiveImageIndex] = useState(0); // Track active image index for carousel
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  

  const handlePaymentOptionChange = (e) => {
    setPaymentOption(e.target.value);
  };

  const handleAgreeToTermsChange = (e) => {
    setAgreeToTerms(e.target.checked); // Update the agreement state
  };

  const handleThumbnailClick = (index) => {
    setActiveImageIndex(index); // Change the main image based on the clicked thumbnail
  };

  const handleConfirmBooking = () => {
    // Navigate to the confirmation page with room details
    navigate("/Bookroomform", { state: { room, paymentOption } });
  };
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatHistory([...chatHistory, message]);
      setMessage("");
    }
  };

  if (!room) {
    return (
      <div className="container mt-5">
        <h2 className="text-center">Room Details</h2>
        <div className="alert alert-danger">Room details not available. Please go back and select a room.</div>
      </div>
    );
  }

  
  // Logout function
  const handleLogout = () => {
    // Remove token from sessionstorage
    sessionStorage.removeItem("token");
    // Redirect to login page
    navigate("/login", { replace: true });
  };
  
  return (
    <>
      {/* Navigation Bar */}
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
                <a className="nav-link" href="/Userroom">About Us</a>
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
                  <li><a className="dropdown-item" href="/MyRoom">My Room</a></li>
                  <li><a className="dropdown-item" href="/MyListings">My Listings</a></li>
                  <li><a className="dropdown-item" href="/saved-providers">Bookmarks</a></li>
                  <li><hr className="dropdown-divider" /></li>
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

      <div className="containerbody">
      <h2 className="text-center mb-4">Room Details</h2>
        <div className="card">
        
        <div className="card-body">
        <h5 className="card-title">{room.roomType} for Rent - {room.roomCity}</h5>
           {/* Main Image Carousel */}
       <div id="roomImageCarousel" className="carousel-slide2" data-bs-ride="false">
            <div className="carousel-inner">
              <div className="carousel-item active">
                <img
                  src={`http://localhost:8070${room.images[activeImageIndex]}`}
                  alt={`Room ${activeImageIndex + 1}`}
                  className="d-block w-100"
                  style={{ maxWidth: '500px', maxHeight: '300px', margin: 'auto', borderRadius: '10px', marginTop: '10px'}} // Custom image size
                />
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="imagethumbnail d-flex mt-3 gap-2">
                      {room.images.map((image, index) => (
                        <img
                          key={index}
                          src={`http://localhost:8070${image}`}
                          alt={`Thumbnail ${index + 1}`}
                          className="img-thumbnail"
                          style={{ width: '60px', height: '60px', cursor: 'pointer', objectFit: 'cover', borderRadius: '5px' }}
                          onClick={() => handleThumbnailClick(index)}
                        />
                      ))}
                    </div>
          {/* Card Body Content */}
          <h5 className="card-title"><strong> Price </strong> Rs. {room.price.toLocaleString()}/ month</h5>
          <p className="card-text"><strong>Published On</strong> - {new Date(room.createdAt).toLocaleString()}</p>
          <p className="card-text"><strong>Description:</strong>{room.description}</p>
          <p className="card-text"><strong>Owner:</strong> {room.ownerName} </p>
          <p className="card-text"><strong>Negotiable:</strong> {room.isNegotiable ? "Yes" : "No"}</p>
           {/* Display Rating History */}
           <div className="rating">
                        <h5><strong>Rating History</strong>  </h5>
                        {room.ratingHistory && room.ratingHistory.length > 0 ? (
                          room.ratingHistory.map((rating, index) => (
                            <div key={index}>
                              <div>  
                              <strong>Buyer Name:</strong> {rating.buyerName}
                            
                                <div>
                                  <strong>Rating:</strong>
                                  {/* Display 5 stars, highlighting the rated number in yellow */}
                                  {Array.from({ length: 5 }, (_, starIndex) => (
                                    <span
                                      key={starIndex}
                                      style={{
                                        fontSize: "20px",
                                        color: starIndex < rating.rating ? "#FFD700" : "#D3D3D3", // Yellow for rated stars, gray for un-rated
                                        cursor: "pointer",
                                      }}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <strong>Description:</strong> {rating.description}
                              {/* Separation line */}
                              <hr style={{ margin: "10px 0", borderTop: "1px solid #ccc" }} />
                            </div>
                          ))
                        ) : (
                          <p>No ratings yet.</p>
                        )}
                      </div>
          

          

        

          {/* Payment Option Radio Buttons */}
          <div className="form-group mt-4">

            <div className="form-check">
              <input
                type="radio"
                id="physicalPayment"
                name="paymentOption"
                value="physical"
                className="form-check-input"
                checked={paymentOption === "physical"}
                onChange={handlePaymentOptionChange}
              />
              <label className="form-check-label" htmlFor="physicalPayment">Pay After Checking Room Physically</label>
            </div>
          </div>

          {/* Display additional message based on payment option */}
          {paymentOption === "physical" && (
            <div className="alert alert-info mt-3">
              <p><strong>We kindly request you to visit the room for a physical check to ensure it meets your 
                requirements before making any payment.</strong></p>
              <p>If the room meets your needs, you may proceed with the payment in person.</p>
            </div>
          )}

          {/* Agreement Checkbox */}
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={agreeToTerms}
              onChange={handleAgreeToTermsChange}
            />
            <label className="form-check-label">
              I agree to the <strong >Terms and Conditions</strong>
              <h6><a href="/Terms">Terms and Conditions</a></h6>
            </label>
          </div>


         

          {/* Disable booking button if terms are not agreed */}
          <button
            className="btn btn-primary mt-3"
            disabled={!agreeToTerms}
            onClick={handleConfirmBooking}
          >
           Add to favourites
          </button>
        </div>
      </div>
    </div>
   
    </>
  );
}

export default BookRoomPage;


