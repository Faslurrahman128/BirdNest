import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Componets/CSS/ViewServiceProvider.css";
import { FaUserCheck, FaUserTimes, FaHome, FaUserClock, FaUserCheck as FaVerified, FaClipboardList, FaSignOutAlt } from "react-icons/fa";

function ViewServiceProviders() {
  const [serviceProviders, setServiceProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchServiceProviders();
  }, []);

  const fetchServiceProviders = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8070/ServiceProvider");
      setServiceProviders(response.data);
    } catch (error) {
      console.error("Error fetching service providers", error);
      alert("Failed to load service providers.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await axios.put(`http://localhost:8070/ServiceProvider/accept/${id}`);
      
      // Show success toast notification
      const toastContainer = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = 'toast-notification success';
      toast.innerHTML = 'Service Provider Verified Successfully!';
      toastContainer.appendChild(toast);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        toast.remove();
      }, 3000);
  
      // Remove the accepted provider from the list
      setServiceProviders(serviceProviders.filter(provider => provider._id !== id));
    } catch (error) {
      console.error("Error verifying service provider", error);
      
      // Show error toast notification
      const toastContainer = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = 'toast-notification error';
      toast.innerHTML = 'Failed to verify service provider.';
      toastContainer.appendChild(toast);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.delete(`http://localhost:8070/ServiceProvider/reject/${id}`);
      
      // Show success toast notification
      const toastContainer = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = 'toast-notification warning';
      toast.innerHTML = 'Service Provider Rejected';
      toastContainer.appendChild(toast);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        toast.remove();
      }, 3000);
      
      setServiceProviders(serviceProviders.filter(provider => provider._id !== id));
    } catch (error) {
      console.error("Error rejecting service provider", error);
      
      // Show error toast notification
      const toastContainer = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = 'toast-notification error';
      toast.innerHTML = 'Failed to reject service provider.';
      toastContainer.appendChild(toast);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }
  };
  
  // Format date string to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Filter service providers based on search term
  const filteredProviders = serviceProviders.filter(provider => 
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.serviceArea.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      {/* Toast Container for Notifications */}
      <div id="toast-container"></div>
      
      {/* Sidebar Navigation */}
      <nav className="dashboard-menu">
        <div className="dashboard-brand">
          <h2>Service Agent Panel</h2>
        </div>
        <ul>
          <li>
            <Link to="/service-agent-dash"><FaHome /> Dashboard</Link>
          </li>
          <li className="active">
            <Link to="/service-provider-list"><FaUserClock /> Unverified Providers</Link>
          </li>
          <li>
            <Link to="/service-provider-verify"><FaVerified /> Verified Providers</Link>
          </li>
          <li className="logout">
            <Link to="/"><FaSignOutAlt /> Logout</Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="content-container">
        <div className="content-header">
          <h2>Unverified Service Providers</h2>
          <div className="search-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by name, service type or area..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading service providers...</p>
          </div>
        ) : (
          <div className="row">
            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider) => (
                <div className="col-md-6 col-lg-4" key={provider._id}>
                  <div className="card service-card">
                    <div className="card-header">
                      <h5 className="card-title">{provider.name}</h5>
                      <span className={`status-badge ${provider.status === "verified" ? "verified" : "pending"}`}>
                        {provider.status}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="info-group">
                        <label>Email:</label>
                        <p>{provider.email}</p>
                      </div>
                      <div className="info-group">
                        <label>Phone:</label>
                        <p>{provider.phoneNumber}</p>
                      </div>
                      <div className="info-group">
                        <label>Service Area:</label>
                        <p>{provider.serviceArea}</p>
                      </div>
                      <div className="info-group">
                        <label>Service Type:</label>
                        <p>{provider.serviceType}</p>
                      </div>
                      <div className="info-group">
                        <label>Description:</label>
                        <p className="description">{provider.description || "N/A"}</p>
                      </div>
                      <div className="info-group">
                        <label>Created At:</label>
                        <p>{formatDate(provider.createdAt)}</p>
                      </div>
                    </div>
                    <div className="card-footer">
                      <button 
                        className="btn btn-accept" 
                        onClick={() => handleAccept(provider._id)}
                      >
                        <FaUserCheck /> Accept
                      </button>
                      <button 
                        className="btn btn-reject" 
                        onClick={() => handleReject(provider._id)}
                      >
                        <FaUserTimes /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 empty-state">
                <div className="empty-state-container">
                  <img src="/empty-state.svg" alt="No data" className="empty-state-img" />
                  <h3>No service providers found</h3>
                  <p>There are no unverified service providers at the moment.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewServiceProviders;