import React from 'react';
import styles from "../Componets/CSS/dash.css"; // Import CSS styles
import { useNavigate, Link } from 'react-router-dom';
import logo from '../Componets/assets/APPLOGO.png';
import '../Componets/CSS/AboutUs.css';
import '../Componets/CSS/AddRoom.css';
import AppHeader from "../Componets/AppHeader";

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

  const navLinks = [
    { label: "🏠 Dashboard",    href: "/dash" },
    { label: "📋 Post Add",     href: "/AddRoom" },
    { label: "🏘️ Properties",   href: "/RoomList" },
    { label: "🔧 Services",     href: "/service-providers" },
    { label: "ℹ️ About Us",     href: "/AboutUs", active: true },
  ];

  const accountLinks = [
    { label: "👤 View Profile",      href: "/profile" },
    { label: "🛏️ My Room",          href: "/MyRoom" },
    { label: "📋 My Listings",       href: "/MyListings" },
    { label: "🎟️ Add a Ticket",      href: "/Ticket" },
    { label: "🔑 Service Provider",  href: "/register-service-provider" },
    { label: "🔖 Bookmarks",         href: "/saved-providers" },
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
    </div>
  );
}

export default AboutUs;