import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import "../Componets/CSS/Profile.css";
import UpdateCustomer from "./UpdateCustomer"; 
import { Pencil, LogOut} from "lucide-react";
import logo from "../Componets/assets/unistaylogo.png";

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

  

  return (
    <>
      <nav className="body">
        <nav className="navbar navbar-expand-lg ">
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
                          <button className="dropdown-item" onClick={handleLogout}><strong>Logout</strong> <i className="fas fa-sign-out-alt"></i></button>
                        </li>
                      )}
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>

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
      </nav>
    </>
  );
}

export default LoggedCustomer;
