import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Add this line
import "../Componets/CSS/Profile.css";
import { Pencil, Trash2, Eye, RefreshCcw, Download } from "lucide-react";
import logo from "../Componets/assets/unistaylogo.png";
import jsPDF from "jspdf"; // Import jsPDF

function LoggedCustomer() {
 
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0); // Track active image index for carousel
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
   const [unconfirmedBooking, setunconfirmedBooking] = useState([]);
  

  const [updatedRoomData, setUpdatedRoomData] = useState({
    roomType: "",
    roomAddress: "",
    roomCity: "",
    price: "",
    description: "",
    images: [],
  });
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    // Check if the token exists in sessionstorage
    const token = sessionStorage.getItem("token");
  
    if (!token) {
      navigate("/login"); // Redirect if token does not exist
      return;
    }

    fetchRooms(); // Fetch rooms after customer details are fetched
  }, [navigate]);
  
  const handleThumbnailClick = (index) => {
    setActiveImageIndex(index); // Change the main image based on the clicked thumbnail
  };
  // Fetch rooms
  const fetchRooms = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setMessage("Please log in to access your rooms.");
      setAlertType("danger");
      navigate("/login");
      return;
    }
  
    try {
      const response = await axios.get("http://localhost:8070/Room/myrooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("API Response:", response.data); // Debugging log
      setRooms(response.data);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to load rooms.");
      setAlertType("danger");
    }
  };
  

  const handlebVerification = async (id) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
        alert("Authorization token is missing. Please log in again.");
        return;
    }

    try {
        const response = await axios.put(
            `http://localhost:8070/Room/confirmbooking/${id}`, // Use `id` instead of `roomId`
            { isBookedconfirm: true }, // Changed from isVerified to isBookedConfirm
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.status === 200) {
            const verifiedRoom = unconfirmedBooking.find((room) => room._id === id);
            setunconfirmedBooking((prevRooms) => prevRooms.filter((room) => room._id !== id));
            setunconfirmedBooking((prevRooms) => [...prevRooms, verifiedRoom]);
            alert("Room booking successfully confirmed!");
        } else {
            alert("Failed to update room booking status.");
        }
    } catch (err) {
        alert("Error updating room booking status: " + (err.response?.data?.error || err.message));
    }
};

  
  const handleRepostRoom = async (roomId) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        alert("Authentication required. Please log in.");
        return;
      }
  
      const response = await axios.put(`http://localhost:8070/room/repost/${roomId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      alert(response.data.message); // Show success message
      window.location.reload(); // Reload to reflect changes
    } catch (err) {
      console.error("Error reposting room:", err.response?.data || err.message);
      alert(err.response?.data?.error || "An error occurred while reposting the room.");
    }
  };
  

  const deleteRoom = async (roomId) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setMessage("Please log in to delete a room.");
      setAlertType("danger");
      return;
    }

    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        const response = await axios.delete(`http://localhost:8070/Room/delete/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRooms((prevRooms) => prevRooms.filter((room) => room._id !== roomId));
        setMessage(response.data.message || "Room deleted successfully.");
        setAlertType("success");
      } catch (err) {
        setMessage(err.response?.data?.error || "Failed to delete room.");
        setAlertType("danger");
      }
    }
  };

  const updateRoom = async (roomId, formData) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setMessage("Please log in to update a room.");
      setAlertType("danger");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8070/Room/update/${roomId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert("Room updated successfully!");
        fetchRooms(); // Reload rooms after update
        setSelectedRoom(null); // Close the update form

   
      } else {
        console.error("Update failed:", data.error);
        alert(`Failed to update room: ${data.error}`);
      }
    } catch (error) {
      console.error("Error during update:", error);
      alert("An error occurred while updating the room.");
    }
  };

  const handleRoomUpdate = (room) => {
    setSelectedRoom(room);
    setUpdatedRoomData({
      roomType: room.roomType,
      roomAddress: room.roomAddress,
      roomCity: room. roomCity,
      price: room.price,
      description: room.description,
      images: room.images, // Keep track of existing images
    });
    setImagePreviews([]); // Start with no previews for new uploads
     // Open the modal for room update
     const modal = new window.bootstrap.Modal(document.getElementById('roomUpdateModal'));
     modal.show();
  };



  const handleRoomFormSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Add new image files to FormData
    imagePreviews.forEach((preview) => {
      if (preview.file) {
        formData.append("images", preview.file);
      }
    });

    // Include a list of existing images to keep
    const imagesToKeep = updatedRoomData.images;
    formData.append("keepImages", JSON.stringify(imagesToKeep));

    // Include other room data
    for (const key in updatedRoomData) {
      if (key !== "images") {
        formData.append(key, updatedRoomData[key]);
      }
    }

    updateRoom(selectedRoom._id, formData);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImagePreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    // Ensure total images (existing + new) do not exceed 10
    if (updatedRoomData.images.length + imagePreviews.length + newImagePreviews.length > 10) {
      alert("You can upload up to 10 images only.");
      return;
    }

    setImagePreviews((prev) => [...prev, ...newImagePreviews]);
  };

  const handleImageDelete = (index, isExisting) => {
    if (isExisting) {
      // Remove from existing images
      const updatedImages = updatedRoomData.images.filter((_, i) => i !== index);
      setUpdatedRoomData((prevData) => ({ ...prevData, images: updatedImages }));
    } else {
      // Remove from new image previews
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleViewBuyerInfo = (room) => {
    setSelectedBuyer(room);
    const buyerInfoModal = new window.bootstrap.Modal(document.getElementById("buyerInfoModal"));
    buyerInfoModal.show();
  };

  // Logout function
  const handleLogout = () => {
    // Remove token from sessionstorage
    sessionStorage.removeItem("token");
    // Redirect to login page
    navigate("/login", { replace: true });
  };

  // Navigate to messaging page with room details
const handleGoToMessaging = (roomId, ownerName) => {
  navigate("/chatpage", { state: { roomId, ownerName } });
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



  return (
    <>
    < nav className="body">
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

      <div className="Listing-container d-flex justify-content-center p-3">
        <div className="my-rooms-container w-55 p-3">
          <h2>My Listings</h2>
          {rooms.length > 0 ? (
          rooms.map((room) => (
            <div key={room._id} className="room-card p-3 mb-3 border rounded d-flex align-items-center">
              
      <div className="room-details">
      
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
        <h3><strong>{room.roomType}</strong> - {room.roomCity}</h3>
        <p><strong>Posted On</strong> - {new Date(room.createdAt).toLocaleString()}</p>
        <p className="room-price"><strong>Price</strong> Rs {room.price.toLocaleString()} / month</p>
        <p><strong>Description </strong>{room.description}</p>
        <p><strong>Address </strong>{room.roomAddress}</p>
        
        <p>
          <strong>Verification:</strong>{" "}
          {room.isVerified ? (
            <>
              <span className="badge bg-success">Verified</span>
              <span className="ms-2">Your room is listed.</span>
            </>
          ) : (
            <>
              <span className="badge bg-warning text-dark">Unverified</span>
              <span className="ms-2">Saff member will contact you to verify.</span>
            </>
          )}
        </p>
        <p>
          <strong>Booking:</strong>{" "}
          {room.isBooked ? (
            <>
              <span className="badge bg-success">Booked</span>
            </>
          ) : (
            <>
              <span className="badge bg-warning text-dark">Not Yet</span>
            </>
          )}
        </p>
        <div className="d-flex justify-content-start mt-2">
        <button 
          className="btn me-1" 
          onClick={() => handleRoomUpdate(room)}
          title="Edit Room"
          disabled={room.isVerified} // Disable button when isBookedconfirm is true
        >
          <Pencil size={20} /> Edit{/* Edit Icon */}
        </button>


          <button 
          className="btn " 
          onClick={() => deleteRoom(room._id)}
          title="Delete Room"
          >
            <Trash2 size={20} /> Delete Room{/* Bin Icon */}
          </button>
         
          

        <button className="btn " onClick={() => handleRepostRoom(room._id)}
          disabled={!room.isBooked}
        >
          <RefreshCcw size={20} />  repost
        </button>

        {room.isBooked && (
            <>
              <button 
                className="btn btn-info" 
                onClick={() => handleViewBuyerInfo(room)}
                title="View Buyer Info"
              >
                <Eye size={20} /> 
              </button>

              <button
                onClick={() => handlebVerification(room._id)}
                className="btn btn-success"
                disabled={room.isBookedconfirm} // Disable if already confirmed
              >
                {room.isBookedconfirm ? "Booking Confirmed" : "Confirm Booking"}
              </button>

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

            
            </>
          )}
        </div>
          {/* New PDF download button */}
          {room.isBookedconfirm && (
                <div className="mt-2 w-50">
                  <button className="btn  me-1" onClick={() => generatePDF(room)} title="Edit Room">
                    <Download size={25} /> {/* download Icon */}
                  </button>
                </div>
              )}
            <h6 className="dowloadtext" >Download the Rental Confirmation from here</h6>

  


        {/* Display Rating History */}
        <div className="mt-3">
                        <h5><strong>Rating History</strong> </h5>
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
       

        

        
      </div>
    </div>
  ))
) : (
  <p>No rooms available.</p>
)}


        </div>
        {/* Buyer Info Modal */}
      <div className="modal fade" id="buyerInfoModal" tabIndex="-1" aria-labelledby="buyerInfoModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="buyerInfoModalLabel">Buyer Information</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {selectedBuyer ? (
                <div>
                  <p><strong>Name:</strong> {selectedBuyer.buyerName}</p>
                  <p><strong>Contact:</strong> {selectedBuyer.buyerContactNumber}</p>
                  <p><strong>NIC:</strong> {selectedBuyer.buyerNIC}</p>
                  <p><strong>Duration:</strong> {selectedBuyer.buyingDuration} months</p>
                  <p><strong>Booking Date:</strong> {new Date(selectedBuyer.buyingDate).toLocaleDateString()}</p>
                </div>
              ) : (
                <p>Loading buyer info...</p>
              )}
            </div>
          </div>
        </div>
      </div>
      

      {/* Modal for Room Update Form */}
      <div className="modal fade" id="roomUpdateModal" tabIndex="-1" aria-labelledby="roomUpdateModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="roomUpdateModalLabel">Update Room</h5>
             
    
            </div>
            <div className="modal-body">
              <form onSubmit={handleRoomFormSubmit}>
                <div className="mb-3">
                  <label className="form-label">Room Type</label>
                  <input
                    type="text"
                    className="form-control"
                    value={updatedRoomData.roomType}
                    onChange={(e) =>
                      setUpdatedRoomData({ ...updatedRoomData, roomType: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Room Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={updatedRoomData.roomAddress}
                    onChange={(e) =>
                      setUpdatedRoomData({ ...updatedRoomData, roomAddress: e.target.value })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Room City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={updatedRoomData.roomCity}
                    onChange={(e) =>
                      setUpdatedRoomData({ ...updatedRoomData, roomCity: e.target.value })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Price</label>
                  <input
                    type="text"
                    className="form-control"
                    value={updatedRoomData.price}
                    onChange={(e) =>
                      setUpdatedRoomData({ ...updatedRoomData, price: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={updatedRoomData.description}
                    onChange={(e) =>
                      setUpdatedRoomData({ ...updatedRoomData, description: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Room Images</label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    onChange={handleImageChange}
                  />
                  <div className="image-previews mt-3">
                    {updatedRoomData.images.map((image, index) => (
                      <div key={index} className="image-preview">
                        <img
                          src={`http://localhost:8070${image}`}
                          alt={`Room image ${index + 1}`}
                          style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "5px" }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleImageDelete(index, true)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="image-preview">
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "5px" }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleImageDelete(index, false)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">Update Room</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      </nav>
    </>
  );
}

export default LoggedCustomer;
