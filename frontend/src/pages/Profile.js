import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import "../Componets/CSS/Profile.css";
import "../Componets/CSS/AddRoom.css";
import AppHeader from "../Componets/AppHeader";
import UpdateCustomer from "./UpdateCustomer"; 
import { Pencil, LogOut} from "lucide-react";
import logo from "../Componets/assets/APPLOGO.png";

function LoggedCustomer() {
  const [customer, setCustomer] = useState(null);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    async function fetchCustomerDetails() {
      try {
        const response = await axios.get("http://localhost:8070/customer/display", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          setCustomer(response.data);
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Error fetching customer details", err);
        navigate("/login");
      }
    }

    fetchCustomerDetails();
  }, [navigate]);

  const handleUpdateClick = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  

  const navLinks = [
    { label: "🏠 Dashboard",    href: "/dash" },
    { label: "📋 Post Add",     href: "/AddRoom" },
    { label: "🏘️ Properties",   href: "/RoomList" },
    { label: "🔧 Services",     href: "/service-providers" },
    { label: "ℹ️ About Us",     href: "/AboutUS" },
  ];

  const accountLinks = [
    { label: "👤 View Profile",      href: "/profile", active: true },
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
            {accountLinks.map(({ label, href, active }) => (
              <Link key={href} to={href} className={`sidebar-link${active ? " sidebar-link--active" : ""}`}>
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

        <div className="Postadd-container-body" style={{ flex: 1, minWidth: 0, paddingRight: '20px' }}>

        <div className="LoggedCustomer-container ">
          <div className="customer-details-container">
            <h2>My Profile</h2>
            <button 
              className="btn me" 
              onClick={handleUpdateClick}
              title="Edit Room"
              
            >
            <i className="icon"></i>
            <Pencil size={25} /> {/* Edit Icon */}
            </button>
            <button 
              className="btn  me-1" 
              onClick={handleLogout}
              title="Edit Room"
              >
              <LogOut size={25} /> {/* Edit Icon */}
            </button>
            {customer ? (
              <div className="CustomerBox">
                <form className="CustomerForm">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      value={customer.name}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="Lname" className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="Lname"
                      value={customer.Lname || "N/A"}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="gender" className="form-label">Gender</label>
                    <input
                      type="text"
                      className="form-control"
                      id="gender"
                      value={customer.Gender || "N/A"}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      id="phone"
                      value={customer.Phonenumber || "N/A"}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={customer.email || "N/A"}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="address" className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      id="address"
                      value={customer.Address || "N/A"}
                      readOnly
                    />
                  </div>
                  
                  
                  

                </form>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>

        <div className={`modal ${showModal ? "show" : ""}`} tabIndex="-1" aria-labelledby="updateModalLabel" aria-hidden="true" style={{ display: showModal ? "block" : "none" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="updateModalLabel">Update Your Account</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleModalClose}></button>
              </div>
              <div className="modal-body">
                {customer && <UpdateCustomer customer={customer} onClose={handleModalClose} />}
              </div>
            </div>
          </div>
        </div>
        {showModal && <div className="modal-backdrop fade show"></div>}
        </div>
      </div>
    </div>
  );
}

export default LoggedCustomer;
