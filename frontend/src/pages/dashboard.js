import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom"; // Access state passed from login
import { useNavigate } from "react-router-dom"; // Navigation hook
import styles from "../Componets/CSS/dash.css"; // Import CSS styles
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap for styling

import logo from "../Componets/assets/unistaylogo.png";

import instagram from '../Componets/assets/Instagram.webp';
import facebook from '../Componets/assets/facebook.png';
import twitter from '../Componets/assets/twitter.png'
import whatsapp from '../Componets/assets/whatsapp.png'
import searchIcon from "../Componets/assets/searchimage.png";

function HomePage() {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Extract message from location state (if available)
  const [alertMessage2, setAlertMessage2] = useState(location.state?.message2 || "");
  const [welcomemessage, setwelcomemessage] = useState(location.state?.message1 || "");
  const [alertType, setAlertType] = useState(location.state?.alertType || "");

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
  const roomsPerPage = 8;
  
  useEffect(() => {
    if (alertMessage2) {
      // Clear the message from state after displaying it once
      const timer = setTimeout(() => {
        setAlertMessage2("");
        setAlertType("");
        navigate(".", { replace: true, state: {} }); // Reset state to avoid showing it again
      }, 6000000); // Hide after 6 seconds

      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [alertMessage2, navigate]);

 

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

  const handleAddPosts= () => {
    navigate("/AddRoom"); // Navigate to the Addrom page
  };
  
  return (
    <>
    
     {/* Alert Message (Pop-up Style) */}
      {alertMessage2 ? (
        <div
          className={`alert alert-${alertType} alert-dismissible fade show fixed-top mx-auto mt-5 p-3 shadow w-50 text-center border border-dark`}
          role="alert"
        >
          {alertMessage2}
          <button
            type="button"
            className="btn-close position-absolute top-0 end-0 m-0"
            data-bs-dismiss="alert"
            aria-label="Close"
            onClick={() => setAlertMessage2(null)}
          ></button>
        </div>
      ) : null}





    < nav className="body">
      
        {/* Navigation Bar and Welcome Section Combined */}
        <div className="navbar navbar-expand-lg">
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
                <a className="nav-link" href="/Dash">Dashboard</a>
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
                <a className="nav-link" href="/AboutUS">About Us</a>
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
                  <li><a className="dropdown-item" href="/Ticket">Add a Ticket</a></li>
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

              {welcomemessage && (
                <li className="nav-item">
                  <div className="nav-link-text-warning">{welcomemessage}</div>
                </li>
              )}
            </ul>
          </div>

          </div>
        </div>

        {/* Welcome Section */}
        <section id="dash">
          <div className="sector01">
            <div className="Homesector1-container">
              <div className="text-section">
              <p className="dash-Maintopic1">Stay Closer, Live Smarter – Your Perfect Home Near Campus!</p>
                <p className="dash-Mainpara1">
                Find boarding houses near your university instantly! 
                Use our filters to select location, property type, and budget—no more endless scrolling!
                </p>
                
              </div>
              
            </div>
          </div>
        </section>
        
      </nav>

      
         <div className="room-list-container">
            <div className="filter-bar">
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
                        <h5>{room.roomType} - {room.roomCity}</h5>
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
         
    

            {/* Process Section */}
            <section className="statistics-section">
              <div className="container">
                <div className="stats-left">
                  <div className="stat-box">
                    <h2 className="stat-value">5+</h2>
                    <p className="stat-label">Years of Service</p>
                  </div>
                  <div className="stat-box">
                    <h2 className="stat-value">10K+</h2>
                    <p className="stat-label">Happy Students</p>
                  </div>
                  <div className="stat-box">
                    <h2 className="stat-value">100+</h2>
                    <p className="stat-label">Verified Listings</p>
                  </div>
                  <div className="stat-box">
                    <h2 className="stat-value">20+</h2>
                    <p className="stat-label">Universities Covered</p>
                  </div>
                </div>
                <div className="stats-right">
                  <h1 className="section-title">Find Your Ideal Student Housing</h1>
                  <p className="section-description">
                    We make it easy for university students to find affordable and
                    comfortable housing near their campus. Browse verified listings and
                    secure your home away from home in just a few clicks.
                  </p>
                  <div className="buttons">
                  <button className="primary-button" onClick={handleBooking}>Rate Us</button>
                  <button className="secondary-button" onClick={handleAddPosts}>Add Post</button>

                    
                  </div>
                </div>
              </div>
            </section>
      
      


        {/* FAQ section */}
<div className={styles['faq-section']}> 
  <section id="faq">
    <div className="FAQ-container">
      <h2 className={'faq-heading'}>Frequently Asked Questions</h2>
      <div className="accordion" id="faqAccordion">
        
        {/* Existing FAQs */}
        <div className="accordion-item mb-3">
          <h2 className="accordion-header" id="questionOne">
            <button 
              className="accordion-button" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#collapseOne" 
              aria-expanded="true" 
              aria-controls="collapseOne"
            >
              How do I book a room?
            </button>
          </h2>
          <div 
            id="collapseOne" 
            className="accordion-collapse collapse show" 
            aria-labelledby="questionOne" 
            data-bs-parent="#faqAccordion"
          >
            <div className="accordion-body">
              You can book a room by browsing through the rooms on the dashboard using the filter options and clicking the "Book" button on your preferred room.
            </div>
          </div>
        </div>

        <div className="accordion-item mb-3">
  <h2 className="accordion-header" id="questionTwo">
    <button 
      className="accordion-button collapsed" 
      type="button" 
      data-bs-toggle="collapse" 
      data-bs-target="#collapseTwo" 
      aria-expanded="false" 
      aria-controls="collapseTwo"
    >
      Can I contact the landlord before booking a room?
    </button>
  </h2>
  <div 
    id="collapseTwo" 
    className="accordion-collapse collapse" 
    aria-labelledby="questionTwo" 
    data-bs-parent="#faqAccordion"
  >
    <div className="accordion-body">
      Yes, once you select a room, you can use the in-app messaging system to communicate with the landlord and clarify any questions before finalizing your booking.
    </div>
  </div>
</div>


        {/* New FAQs */}
        <div className="accordion-item mb-3">
          <h2 className="accordion-header" id="questionThree">
            <button 
              className="accordion-button collapsed" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#collapseThree" 
              aria-expanded="false" 
              aria-controls="collapseThree"
            >
              How can I find rooms that match my preferences?
            </button>
          </h2>
          <div 
            id="collapseThree" 
            className="accordion-collapse collapse" 
            aria-labelledby="questionThree" 
            data-bs-parent="#faqAccordion"
          >
            <div className="accordion-body">
              Use the filter options provided on the dashboard to search for rooms based on location, price, number of beds, and other preferences.
            </div>
          </div>
        </div>

        <div className="accordion-item mb-3">
          <h2 className="accordion-header" id="questionFour">
            <button 
              className="accordion-button collapsed" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#collapseFour" 
              aria-expanded="false" 
              aria-controls="collapseFour"
            >
              How can I get help if I face an issue?
            </button>
          </h2>
          <div 
            id="collapseFour" 
            className="accordion-collapse collapse" 
            aria-labelledby="questionFour" 
            data-bs-parent="#faqAccordion"
          >
            <div className="accordion-body">
              You can raise a support ticket through your dashboard. Our service provider team will respond to your issue as soon as possible.
            </div>
          </div>
        </div>

        <div className="accordion-item mb-3">
          <h2 className="accordion-header" id="questionFive">
            <button 
              className="accordion-button collapsed" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#collapseFive" 
              aria-expanded="false" 
              aria-controls="collapseFive"
            >
              How do landlords add their rooms to the platform?
            </button>
          </h2>
          <div 
            id="collapseFive" 
            className="accordion-collapse collapse" 
            aria-labelledby="questionFive" 
            data-bs-parent="#faqAccordion"
          >
            <div className="accordion-body">
              Landlords can add rooms by logging into their account and navigating to the "Add Room" page from the main menu. They can then fill in room details and submit for verification.
            </div>
          </div>
        </div>

        <div className="accordion-item mb-3">
          <h2 className="accordion-header" id="questionSix">
            <button 
              className="accordion-button collapsed" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#collapseSix" 
              aria-expanded="false" 
              aria-controls="collapseSix"
            >
              Who verifies the room listings?
            </button>
          </h2>
          <div 
            id="collapseSix" 
            className="accordion-collapse collapse" 
            aria-labelledby="questionSix" 
            data-bs-parent="#faqAccordion"
          >
            <div className="accordion-body">
              Our admin team reviews each room listing submitted by landlords to ensure accuracy and quality before publishing them on the platform.
            </div>
          </div>
        </div>

        <div className="accordion-item mb-3">
          <h2 className="accordion-header" id="questionSeven">
            <button 
              className="accordion-button collapsed" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#collapseSeven" 
              aria-expanded="false" 
              aria-controls="collapseSeven"
            >
              What happens after I book a room?
            </button>
          </h2>
          <div 
            id="collapseSeven" 
            className="accordion-collapse collapse" 
            aria-labelledby="questionSeven" 
            data-bs-parent="#faqAccordion"
          >
            <div className="accordion-body">
              Once you book a room, the booking will be confirmed upon payment and you will receive a confirmation message. The landlord will also be notified about your booking.
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</div>


{/* Newsletter Section */}
<div className="newsletter-container d-flex justify-content-center align-items-center vh-100">
      <div className="card newsletter-card">
        <div className="row g-0">
          <div className="col-md-8 p-4">
            <h3 className="newlettertopic" >
              Subscribe our <strong>Newsletter</strong>
            </h3>
            <p className="text-muted">
              Join our newsletter to stay on top of current information and
              events.
            </p>
            <form className="d-flex mt-3">
              <input
                type="email"
                className="input-box"
                placeholder="Enter your email address"
                required
              />
              <button type="submit" className="submit-btn">
                Submit
              </button>
            </form>
          </div>
          <div className="col-md-4 d-flex align-items-center justify-content-center">
            <div className="illustration"></div>
          </div>
        </div>
      </div>
    </div>
        
          {/*Footer section */}
          <section id="contact">
            <div className={styles.footer}> {/* Corrected className for custom CSS */}
              <footer>
                <div id="footer_content" className="container">
                  <div id="footer_contacts">
                    </div>
              
                  <div className="row">
                    
                    <div className="col-md-4">
                      <h3>Contact</h3>
                      <ul className="list-unstyled">
                        <li>Email: support@boardingmanagement.com</li>
                        <li>Phone: +123-456-7890</li>
                      </ul>
                    </div>
              
              
                    <div className="col-md-4">
                      <div className="soci">
                        <h3>Socials</h3>
                          <div id="footer_social_media">
                            <a href="#" className="footer-link" id="instagram">
                              <img src={instagram} className="footer-link"  id="instagram" />
                                <i className="fa-brands fa-instagram"></i>
                            </a>
                            <a href="#" className="footer-link" id="facebook">
                              <img src={whatsapp} className="footer-link"  id="Facebook" />
                                <i className="fa-brands fa-facebook-f"></i>
                            </a>
                            <a href="#" className="footer-link" id="whatsapp">
                              <img src={facebook} className="footer-link"  id="whatapp" />
                                <i className="fa-brands fa-whatsapp"></i>
                            </a>
                            <a href="#" className="footer-link" id="twitter">
                              <img src={twitter} className="footer-link"  id="twitter" />
                                <i className="fa-brands fa-twitter"></i>
                            </a>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="footer_copyright" className="text-center">
                  &copy; 2025 Boarding Management. All rights reserved.
                </div>
            </footer>
          </div>
      </section>        
    </>
  );
};

export default HomePage;
