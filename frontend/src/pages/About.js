import React from 'react';
import styles from "../Componets/CSS/dash.css"; // Import CSS styles
import { useNavigate } from 'react-router-dom';
import logo from '../Componets/assets/unistaylogo.png';
import '../Componets/CSS/AboutUs.css'

import instagram from '../Componets/assets/Instagram.webp';
import facebook from '../Componets/assets/facebook.png';
import twitter from '../Componets/assets/twitter.png'
import whatsapp from '../Componets/assets/whatsapp.png'


function AboutUs() {
  const navigate = useNavigate();

  // Logout function
  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Navigation Bar */}
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
                  <li><a className="dropdown-item" href="/saved-providers">Bookmarks</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  {sessionStorage.getItem('token') && (
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}><strong>Logout</strong></button>
                    </li>
                  )}
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="Postadd-container-body">
        <div className="Postadd-container">
          <h2 className="mt-1">About Us</h2>
          <p>
            Learn more about our platform and how we connect landlords and renters to find the perfect boarding.
          </p>

          {/* Who We Are Section */}
          <div className="section">
            <h3 className="section-title">Who We Are</h3>
            <p className="section-text">
              We are a team dedicated to simplifying the process of renting and listing boardings, including Annexes, Single Rooms, Shared Rooms, and Apartments. Our platform ensures a trusted experience by having boarding managers review every listing before it goes live.
            </p>
            <p className="section-text">
              Our team: Brian, Sanduni, Senya, Nishika, and Joel.
            </p>
          </div>

          {/* How It Works Section */}
          <div className="section">
            <h3 className="section-title">How It Works</h3>
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="step-card">
                  <span className="step-number">1</span>
                  <h4 className="step-title">Landlord Submits</h4>
                  <p className="step-text">Landlords list their Annex, Single Room, Shared Room, or Apartment.</p>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className="step-card">
                  <span className="step-number">2</span>
                  <h4 className="step-title">Manager Approves</h4>
                  <p className="step-text">Our team verifies and approves listings for quality.</p>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className="step-card">
                  <span className="step-number">3</span>
                  <h4 className="step-title">Renter Browses</h4>
                  <p className="step-text">Renters explore listings and message landlords.</p>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className="step-card">
                  <span className="step-number">4</span>
                  <h4 className="step-title">Physical Payment</h4>
                  <p className="step-text">Payments are finalized directly between parties.</p>
                </div>
              </div>
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
}

export default AboutUs;