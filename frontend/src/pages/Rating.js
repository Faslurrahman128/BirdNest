import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Bootstrap JS
import "../Componets/CSS/Profile.css";
import { Download, Rating} from "lucide-react";
import logo from "../Componets/assets/unistaylogo.png";
import jsPDF from "jspdf"; // Import jsPDF

function LoggedCustomer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    roomId: "",
    buyerName: "",
    rating: "",
    description: "", // Rating description
  });
  const [activeImageIndex, setActiveImageIndex] = useState(0); // Track active image index for carousel
  const [isRateButtonEnabled, setIsRateButtonEnabled] = useState(false); // Track the state of the rate button

  const handleThumbnailClick = (index) => {
    setActiveImageIndex(index); // Change the main image based on the clicked thumbnail
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect if token does not exist
      return;
    }

    fetchRooms(); // Fetch rooms after customer details are fetched
  }, [navigate]);

  // Fetch rooms
  const fetchRooms = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get("http://localhost:8070/Room/mybooking", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load rooms.");
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle room rating submission
  const handleRateRoom = async (e) => {
    e.preventDefault();

    if (!formData.rating || !formData.description) {
      setError("Please provide both a rating and a description.");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.post(
        "http://localhost:8070/room/rate",
        {
          roomId: formData.roomId, // Automatically taken from formData
          rating: formData.rating,
          buyerName: formData.buyerName, // Automatically taken from formData
          description: formData.description, // Send the rating description
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        alert("Thank you for rating the room!");
        // Reset form after successful submission
        setFormData({ rating: "", buyerName: "", description: "", roomId: "" });
        // Refresh rooms to show updated rating status
        fetchRooms();
        setIsRateButtonEnabled(true); // Enable the download button after rating
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred while submitting the rating.");
    }
  };

  const handleRatingChange = (rating) => {
    setFormData({ ...formData, rating });
  };

  // Logout function
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const generatePDF = (room) => {
    const doc = new jsPDF();
    
    // Add Title (with background color and bold text)
    doc.setFillColor(6, 57, 112); // Set background color for title
    doc.rect(0, 0, 210, 20, 'F'); // Create a filled rectangle for title background
    doc.setTextColor(255, 255, 255); // Set text color (white)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    
    doc.text("Unistay - Rental Confirmation", 20, 15);
    
    // Add a thank you message for the buyer and staff (Text color: Dark Blue)
    doc.setTextColor(0, 0, 139); // Dark blue color for the message
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
   
    doc.text("Thank you for choosing Unistay!", 20, 30);
    doc.text("Your room details are as follows:", 20, 40);
  
    // Add "Room Owner Details" topic
    doc.setTextColor(0, 0, 0); // Black color for text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Room Details", 20, 50);
    
    // Draw the room owner details
    const margin = 20;
    const margin2 = 15;
    const detailsWidth = 90; // Width for room and owner details
    const detailsWidth2 = 75; // Width for room and owner details
    const formattedDate = new Date(room.createdAt).toLocaleString(); // Convert to readable format
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10); // Reduced font size for better fit
    
    doc.text(`Owner Name: ${room.ownerName}`, margin2 + 5, 60); 
    doc.text(`Owner Contact: ${room.ownerContactNumber}`, margin2 + 5, 70);
    doc.text(`Posted On: ${formattedDate}`, margin2 + 5, 80);
    doc.text(`Room Type: ${room.roomType}`, margin2 +  5, 90);
    doc.text(`Room City: ${room.roomCity}`, margin2 +  5, 100);
    doc.text(`Price: Rs ${room.price.toLocaleString()} / month`, margin2 +  5, 110);
    doc.text(`Room Address: ${room.roomAddress}`, margin2 + 5,120);
    
    // Add a space between sections
    doc.text("", margin, 85);
    
    // Add "Room Details" topic (above room details section)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Tenant Details", margin + detailsWidth2 + 20, 50);
    
    // Draw the room details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10); // Reduced font size for better fit
    
    doc.text(`Tenant ID: ${room.buyerCustomerId}`, margin + detailsWidth + 5, 60);
    doc.text(`Tenant Name: ${room.buyerName}`, margin + detailsWidth + 5, 70);
    doc.text(`Tenant NIC: ${room.buyerNIC}`, margin + detailsWidth + 5, 80);
    doc.text(`Tenant Contact Number: ${room.buyerContactNumber}`, margin + detailsWidth + 5, 90);
    doc.text(`Rented Date: ${room.buyingDate}`, margin + detailsWidth + 5, 100);
    doc.text(`Rental Period: ${room.buyingDuration} Months`, margin + detailsWidth + 5, 110);
    
    // Add another horizontal line to separate sections
    doc.setDrawColor(0, 0, 0); // Black line
    doc.setLineWidth(0.5);
    doc.line(margin, 130, 190, 130); // Line after the details
    
    // Add Thank You message at the end (Green color)
    doc.setTextColor(34, 139, 34); // Green color for the final message
    doc.text("We hope to serve you again!", 20, 135);
    doc.text("Please consider adding a rating for the room. Your feedback helps the owner in future postings!", 20, 140);
    
    
    // Add contact details and ticket system information
    doc.setTextColor(0, 0, 0); // Black color for text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("For any issues or inquiries, please use our built-in ticket system on the Unistay website.", 20, 150);
    doc.text("You can also reach out to our support team:", 20, 155);
    doc.text("Hotline: +077 222 3388", 20, 160);
    doc.text("Email: support@unistay.com", 20, 165);
    
    // Add rating suggestion line
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    
    // Save the generated PDF
    doc.save(`Room_${room.roomType}_Booking_Receipt.pdf`);
};

// Navigate to messaging page with room details
const handleGoToMessaging = (roomId, buyerName) => {
  navigate("/chatpage", { state: { roomId, buyerName} });
};


  return (
    <>
      <nav className="body">
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
                <li className="nav-item"><a className="nav-link" href="/dash">Dashboard</a></li>
                <li className="nav-item"><a className="nav-link" href="/AddRoom">Post Add</a></li>
                <li className="nav-item"><a className="nav-link" href="/RoomList">Properties</a></li>
                <li className="nav-item">
                <a className="nav-link" href="/service-providers">Services</a>
              </li>
                <li className="nav-item"><a className="nav-link" href="/Userroom">About Us</a></li>
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
                        <button className="dropdown-item" onClick={handleLogout}><strong>Logout</strong></button>
                      )}
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="rating-container d-flex flex-wrap justify-content-center p-3">
         
          <div className="my-rooms-container w-45 p-3">
            <h2>My Room</h2>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <div key={room._id} className="room-card p-3 mb-3 border rounded d-flex align-items-center">
                  <div className="room-details">
                  <div className="d-flex flex-column align-items-center">
                      {!room.isBookedconfirm && (
                        <p className="text-danger mb-1">The owner has not confirmed yet. Once confirmed, you will be able to download the Confirmation PDF.</p>
                      )}
                      </div>
                  {/* Container for the button and image carousel */}
                  <div className="d-flex ">
                    

                    {/* Main Image Carousel */}
                    <div id="roomImageCarousel" className="carousel slide mt-3" data-bs-ride="false">
                      <div className="image">
                        <div className="carousel-item active">
                          <img
                            src={`http://localhost:8070${room.images[activeImageIndex]}`}
                            alt={`Room ${activeImageIndex + 1}`}
                            className="d-block"
                            style={{ width: '500px', height: '300px', objectFit: 'cover', borderRadius: '10px' }}
                          />
                        </div>
                      </div>
                    </div>
                      {/* Rate Room Button */}
                      <button
                      className="ratingbtn btn-primary mt-2"
                      data-bs-toggle={room.isBookedconfirm ? "modal" : ""}
                      data-bs-target={room.isBookedconfirm ? "#rateRoomModal" : ""}
                      onClick={() => {
                        if (room.isBookedconfirm) {
                          if (room.ratingHistory && room.ratingHistory.some(rating => rating.buyerName === room.buyerName)) {
                            alert("You have already rated this room.");
                          } else {
                            setFormData({ ...formData, roomId: room._id, buyerName: room.buyerName });
                          }
                        }
                      }}
                      disabled={!room.isBookedconfirm || (room.ratingHistory && room.ratingHistory.some(rating => rating.buyerName === room.buyerName))}
                    >
                      {room.isBookedconfirm
                        ? room.ratingHistory && room.ratingHistory.some(rating => rating.buyerName === room.buyerName)
                          ? "Already Rated"
                          : "Rate Room"
                        : "Add Rating"}
                        
                    </button>
      
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


                    <h3><strong>{room.roomType}</strong> - {room.roomCity}</h3>
                    <p><strong>Posted On</strong> - {new Date(room.createdAt).toLocaleString()}</p>
                    <p><strong>Owner Name</strong> {room.ownerName}</p>
                    <p><strong>Owner Contact Number</strong> {room.ownerContactNumber}</p>
                    <p className="room-price"><strong>Price</strong> Rs {room.price.toLocaleString()} / month</p>
                    <p><strong>Address</strong> {room.roomAddress}</p>
                    <p><strong>Booked Date</strong> {room.createdAt}</p>
                    <p><strong>Duration</strong> {room.buyingDuration} Months</p>

                   
                      
                    

                    {/* New PDF download button */}
                    
                    {room.isBookedconfirm && (
                          <div className="mt-2 w-50">
                            <button className="btn  me-1" onClick={() => generatePDF(room)} title="Edit Room">
                              <Download size={25} /> {/* download Icon */}
                            </button>
                          </div>
                        )}
                        <h6 className="dowloadtext" >Download the Rental Confirmation from here</h6>


                    {/* Messaging Button */}
                    <button
                      className="btn btn-info mt-3 position-relative"
                      onClick={() => handleGoToMessaging(room._id, room.buyerName)}
                    >
                      Messages
                      {room.chatHistory && room.chatHistory.length > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        !
                        </span>
                      )}
                    </button>

                    {/* Display Rating History */}
                    <div className="mt-3">
                      <h5><strong>Rating History</strong> </h5>
                      {room.ratingHistory && room.ratingHistory.length > 0 ? (
                        room.ratingHistory.map((rating, index) => (
                          <div key={index}>
                            <div>
                              
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
                  </div>
                </div>
              ))
            ) : (
              <p>No rooms available.</p>
            )}
          </div>
        </div>
      </nav>

      {/* Rating Modal */}
      <div className="modal fade" id="rateRoomModal" tabIndex="-1" aria-labelledby="rateRoomModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="rateRoomModalLabel">Rate Room</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleRateRoom}>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="mb-3">
                  <label className="form-label">Rating</label>
                  <div className="d-flex">
                    {Array.from({ length: 5 }, (_, index) => (
                      <span
                        key={index}
                        onClick={() => handleRatingChange(index + 1)}
                        style={{
                          fontSize: "30px",
                          cursor: "pointer",
                          color: index < formData.rating ? "#FFD700" : "#D3D3D3", // Filled or empty stars
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Rating Description</label>
                  <textarea
                    name="description"
                    className="form-control"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="submit" className="btn btn-primary">Submit Rating</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoggedCustomer;
