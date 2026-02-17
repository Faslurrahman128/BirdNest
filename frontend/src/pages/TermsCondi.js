import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../Componets/assets/unistaylogo.png';
import '../Componets/CSS/TermsCondi.css';
import styles from "../Componets/CSS/dash.css"; // Import CSS styles

import instagram from '../Componets/assets/Instagram.webp';
import facebook from '../Componets/assets/facebook.png';
import twitter from '../Componets/assets/twitter.png'
import whatsapp from '../Componets/assets/whatsapp.png'


function Terms() {
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
              <li className="nav-item">
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
                  <li><a className="dropdown-item" href="/register-service-provider">Service Provider</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  {sessionStorage.getItem('token') && (
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>Logout</button>
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
          <h2 className="mt-1">Terms and Conditions</h2>
          <p>
            Welcome to our boarding management system. By using our platform, you agree to the following terms and conditions. Please read them carefully.
          </p>

          {/* Terms Section */}
          <div className="section">
            <h3 className="section-title">1. General Terms</h3>
            <p className="section-text">
              Our platform connects landlords and renters for boarding listings, including Annexes, Single Rooms, Shared Rooms, and Apartments. Users must be at least 18 years old and provide accurate information during registration and listing processes.
            </p>
          </div>

          <div className="section">
            <h3 className="section-title">2. Landlord Responsibilities</h3>
            <p className="section-text">
              Landlords must submit complete and accurate listing details, including room type, address, city, price, and images (1-10). Listings are subject to review and approval by our boarding managers. Landlords are responsible for maintaining the condition of their properties and responding to renter inquiries promptly.
            </p>
          </div>

          <div className="section">
            <h3 className="section-title">3. Renter Responsibilities</h3>
            <p className="section-text">
              Renters must use the platform to browse listings, contact landlords, and express interest. Renters agree to communicate respectfully and finalize agreements directly with landlords. Any disputes between renters and landlords are to be resolved independently of the platform.
            </p>
          </div>

          <div className="section">
            <h3 className="section-title">4. Boarding Manager Role</h3>
            <p className="section-text">
              Boarding managers review and approve listings to ensure quality and compliance with platform standards. The platform reserves the right to reject or remove listings that do not meet these standards without prior notice.
            </p>
          </div>

          <div className="section">
            <h3 className="section-title">5. Payment Terms</h3>
            <p className="section-text">
              All payments for rentals are handled physically between landlords and renters outside the platform. The platform does not process, facilitate, or take responsibility for any financial transactions or disputes arising from payments.
            </p>
          </div>

          <div className="section">
            <h3 className="section-title">6. User Conduct</h3>
            <p className="section-text">
              Users agree not to post misleading, offensive, or illegal content. The platform may suspend or terminate accounts for violations of these terms, including fraudulent listings, harassment, or unauthorized use.
            </p>
          </div>

          <div className="section">
            <h3 className="section-title">7. Liability</h3>
            <p className="section-text">
              The platform is not liable for any damages, losses, or disputes arising from the use of our services, including issues with property conditions, landlord-renter agreements, or payment disputes. Users use the platform at their own risk.
            </p>
          </div>

          <div className="section">
            <h3 className="section-title">8. Changes to Terms</h3>
            <p className="section-text">
              We may update these terms and conditions at any time. Continued use of the platform after changes constitutes acceptance of the updated terms. Users are encouraged to review this page periodically.
            </p>
          </div>

          <div className="section">
            <h3 className="section-title">9. Contact Us</h3>
            <p className="section-text">
              For questions or concerns about these terms, please contact our support team through the platform's messaging system or via the contact details provided in the About Us section.
            </p>
          </div>
        </div>
      </div>{/*Footer section */}
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

export default Terms;