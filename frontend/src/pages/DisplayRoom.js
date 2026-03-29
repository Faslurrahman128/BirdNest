import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Navigation hooks
import axios from "axios";
import searchIcon from "../Componets/assets/searchimage.png";
import '../Componets/CSS/DisplayRoom.css';
import logo from "../Componets/assets/unistaylogo.png";

function RoomList() {
  const location = useLocation();
  const { state } = location || {};
  const message = state?.message || null;
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [priceFilter, setPriceFilter] = useState(50000);
  const [locationFilter, setLocationFilter] = useState("");
  const [locations, setLocations] = useState([]); // For dropdown suggestions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("");
  const uniqueRoomTypes = [...new Set(rooms.map((room) => room.roomType))]; // Extract unique room types
  const roomsPerPage = 8; // Display 8 rooms per page
  const navigate = useNavigate();
  

  const handleBooking = (room) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      const proceed = window.confirm(
        "You need to log in before booking a room. Do you want to proceed to the login page?"
      );
      if (proceed) {
        navigate("/Login", { state: { room } });
      }
    } else {
      navigate("/Bookroom", { state: { room } });
    }
  };

  useEffect(() => {
    const fetchRoomsAndLocations = async () => {
      try {
        const response = await axios.get("http://localhost:8070/rooms"); // Updated path
        const verifiedRooms = response.data.filter((room) => room.isVerified && !room.isBooked); // Only verified and not booked rooms
        setRooms(verifiedRooms);
        setFilteredRooms(verifiedRooms);
  
        // Extract unique locations for the dropdown
        const uniqueLocations = [...new Set(verifiedRooms.map((room) => room.roomCity))];
        setLocations(uniqueLocations);
  
        setLoading(false);
      } catch (error) {
        setError("Error fetching rooms. Please try again later.");
        setLoading(false);
      }
    };
  
    fetchRoomsAndLocations();
  }, []);
  
  
  
      
       const applyFilters = () => {
         const filtered = rooms.filter((room) => {
           const isPriceValid =
           priceFilter === 4000
           ? room.price < 10000
           : priceFilter === 12000
           ? room.price >= 10000 && room.price <= 15000
           : priceFilter === 20000
           ? room.price > 15000
           : true;
 
       const isLocationValid = locationFilter
       ? room.roomCity.toLowerCase().startsWith(locationFilter.toLowerCase())
       : true;
   
       const isPropertyTypeValid = propertyTypeFilter
         ? room.roomType.toLowerCase() === propertyTypeFilter.toLowerCase()
         : true;
   
      
       return isPriceValid && isLocationValid && isPropertyTypeValid;
       });
       
         setFilteredRooms(filtered);
         setCurrentPage(1); // Reset to the first page
       };
     
       const indexOfLastRoom = currentPage * roomsPerPage;
       const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
       const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);
       const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
     
       const handlePageChange = (pageNumber) => {
         setCurrentPage(pageNumber);
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

      <div className="room-list-container2">
                  <div className="filter-bar2">
                    <div className="filter-item">
                      <label htmlFor="location">Location</label>
                      <select
                        id="location"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                      >
                        <option value="">All Locations</option>
                          {locations.map((location, index) => (
                            <option key={index} value={location}>
                              {location}
                            </option>
                          ))}
                      </select>
                    </div>
                
                    <div className="filter-item">
                      <label htmlFor="propertyType">Property Type</label>
                        <select
                          id="propertyType"
                          value={propertyTypeFilter}
                          onChange={(e) => setPropertyTypeFilter(e.target.value)}
                        >
                        <option value="">Select Property Type</option>
                          {uniqueRoomTypes.map((type, index) => (
                          <option key={index} value={type}>
                            {type}
                          </option>
                          ))}
                        </select>
                      </div>
                
                      <div className="filter-item">
                        <label htmlFor="priceRange">Price Range</label>
                          <select
                            id="priceRange"
                            value={priceFilter}
                            onChange={(e) => setPriceFilter(Number(e.target.value))}
                          >
                            <option value="">All</option>
                            <option value={4000}>Below Rs.10,000 / month</option>
                            <option value={12000}>Rs.10,000 - Rs.15,000 / month</option>
                            <option value={20000}>Above Rs.15,000 / month</option>
                          </select>
                        </div>
                
                        <button className="filter-search-btn" onClick={applyFilters}>
                          Search
                        </button>
                  </div>
              
            <div className="room-grid">
                {currentRooms.length === 0 ? (
                  <div className="no-results">No rooms match your criteria.</div>
                ) : (
                  currentRooms.map((room) => (
                    <div className="room-card" key={room._id}>
                      <img
                        src={`http://localhost:8070${room.images[0]}`}
                        alt="Room"
                        className="room-image"
                        onClick={() => handleBooking(room)}
                      />
                      <div className="room-info">
                        <h5>{room.roomType}  - {room.roomCity}</h5>
                        <p className="room-price">Rs {room.price.toLocaleString()}</p>
                       
                        {/* Rating History Summary */}
                      <div className="mt-3">
                       
                        {room.ratingHistory && room.ratingHistory.length > 0 ? (() => {
                          // Count occurrences of each rating
                          const ratingCounts = room.ratingHistory.reduce((acc, { rating }) => {
                            acc[rating] = (acc[rating] || 0) + 1;
                            return acc;
                          }, {});

                          // Find the most common rating
                          const mostRated = Object.keys(ratingCounts).reduce((a, b) =>
                            ratingCounts[a] > ratingCounts[b] ? a : b
                          );

                          return (
                            <div>
                              <strong>Most Rated:</strong> 
                              <div>
                                {Array.from({ length: 5 }, (_, index) => (
                                  <span key={index} style={{ color: index < mostRated ? "#FFD700" : "#D3D3D3" }}>
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })() : (
                          <p>No ratings yet.</p>
                        )}
                      </div>

                      </div>
                    </div>
                  ))
                )}
              </div>
      
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={`page-button ${currentPage === pageNumber ? "active" : ""}`}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
            </div>
          

        
     
    </>
  );
}

export default RoomList;
