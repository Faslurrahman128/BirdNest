import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import '../Componets/CSS/DisplayRoom.css';
import logo from "../Componets/assets/APPLOGO.png";

function RoomList() {
  const location = useLocation();
  const { state } = location || {};
  const message = state?.message || null;
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [priceFilter, setPriceFilter] = useState(50000);
  const [locationFilter, setLocationFilter] = useState("");
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("");
  const uniqueRoomTypes = [...new Set(rooms.map((room) => room.roomType))];
  const roomsPerPage = 8;
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
        const response = await axios.get("http://localhost:8070/rooms");
        const verifiedRooms = response.data.filter((room) => room.isVerified && !room.isBooked);
        setRooms(verifiedRooms);
        setFilteredRooms(verifiedRooms);
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
    setCurrentPage(1);
  };

  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Recently added";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return ` ${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Format price with currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
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

      <div className="main-container">
        <div className="filter-bar2">
          <div className="filter-group">
            <div className="filter-item">
              <div className="filter-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <div className="filter-field">
                <label htmlFor="location">Location</label>
                <select id="location" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                  <option value="">All locations</option>
                  {locations.map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-divider" />

            <div className="filter-item">
              <div className="filter-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </div>
              <div className="filter-field">
                <label htmlFor="propertyType">Property type</label>
                <select id="propertyType" value={propertyTypeFilter} onChange={(e) => setPropertyTypeFilter(e.target.value)}>
                  <option value="">Any type</option>
                  {uniqueRoomTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-divider" />

            <div className="filter-item">
              <div className="filter-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                </svg>
              </div>
              <div className="filter-field">
                <label htmlFor="priceRange">Price range</label>
                <select id="priceRange" value={priceFilter} onChange={(e) => setPriceFilter(Number(e.target.value))}>
                  <option value="">Any price</option>
                  <option value={4000}>Below Rs. 10,000</option>
                  <option value={12000}>Rs. 10,000 – 15,000</option>
                  <option value={20000}>Above Rs. 15,000</option>
                </select>
              </div>
            </div>
          </div>

          <button className="filter-search-btn" onClick={applyFilters}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            Search
          </button>
        </div>

        {/* ENHANCED ROOMS GRID SECTION */}
        <div className="rooms-wrapper">
          {currentRooms.length === 0 ? (
            <div className="no-results-enhanced">
              <div className="no-results-icon">🏠</div>
              <h3>No properties found</h3>
              <p>We couldn't find any rooms matching your criteria.</p>
              <button className="clear-filters-btn" onClick={() => {
                setLocationFilter("");
                setPropertyTypeFilter("");
                setPriceFilter(50000);
                applyFilters();
              }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="results-stats">
                <span>Showing {indexOfFirstRoom + 1}-{Math.min(indexOfLastRoom, filteredRooms.length)} of {filteredRooms.length} properties</span>
              </div>
              
              <div className="room-grid-enhanced">
                {currentRooms.map((room) => {
                  const postDate = room.createdAt || room.postedDate || room.date || new Date().toISOString();
                  
                  return (
                    <div className="room-card-enhanced" key={room._id}>
                      <div className="card-image-wrapper">
                        <img
                          src={`http://localhost:8070${room.images[0]}`}
                          alt={room.roomType}
                          className="room-image-enhanced"
                          onClick={() => handleBooking(room)}
                        />
                        <div className="card-badge">
                          <span className="property-type-badge">{room.roomType}</span>
                        </div>
                        <button className="quick-view-btn" onClick={() => handleBooking(room)}>
                          Quick View
                        </button>
                      </div>
                      
                      <div className="card-content">
                        <div className="property-header">
                          <h3 className="property-title">{room.roomType}</h3>
                          <div className="property-location">
                            <svg className="location-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            <span>{room.roomCity}</span>
                          </div>
                        </div>
                        
                        <div className="price-section">
                          <span className="price-amount-enhanced">{formatPrice(room.price)}</span>
                          <span className="price-period">/month</span>
                        </div>

                        {/* Posted Date Section - Replaced Rating */}
                        <div className="posted-date-section">
                          <div className="date-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                            </svg>
                          </div>
                          <div className="date-text">
                            <span className="date-label">Posted on</span>
                            <span className="date-value">{formatDate(postDate)}</span>
                          </div>
                        </div>
                        
                        <div className="property-features">
                          <div className="feature">
                            <svg className="feature-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                            </svg>
                            <span>Private Room</span>
                          </div>
                          <div className="feature">
                            <svg className="feature-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 3v1h6v1h-6v1h6v1h-6v1h4v5h-2v-4h-2v4H8v-4H6v4H4v-5h2V8H4V6h2V5h2V3h4z"/>
                            </svg>
                            <span>Furnished</span>
                          </div>
                        </div>
                        
                        <button className="book-now-btn" onClick={() => handleBooking(room)}>
                          Book Now
                          <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="pagination-enhanced">
                  <button
                    className="page-nav-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  
                  <div className="page-numbers-enhanced">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        className={`page-number-enhanced ${currentPage === pageNumber ? "active" : ""}`}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    className="page-nav-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default RoomList;
