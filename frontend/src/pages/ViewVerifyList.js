import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Componets/CSS/ViewServiceProvider.css";
import { FaHome, FaUserClock, FaUserCheck, FaClipboardList, FaSignOutAlt, FaSearch, FaDownload } from "react-icons/fa";

function ViewVerifyList() {
  const [verifiedProviders, setVerifiedProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchVerifiedProviders();
  }, []);

  const fetchVerifiedProviders = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8070/ServiceProvider/verified");
      setVerifiedProviders(response.data);
    } catch (error) {
      console.error("Error fetching verified providers", error);
      
      // Show error toast notification
      const toastContainer = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = 'toast-notification error';
      toast.innerHTML = 'Failed to load verified service providers.';
      toastContainer.appendChild(toast);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        toast.remove();
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // Format date string to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Filter verified providers based on search term
  const filteredProviders = verifiedProviders.filter(provider => 
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.serviceArea.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Export providers to CSV
  const exportToCSV = () => {
    if (verifiedProviders.length === 0) return;
    
    // Convert data to CSV format
    const headers = ["Name", "Email", "Phone", "Service Area", "Service Type", "Description", "Status", "Created At"];
    
    const csvData = verifiedProviders.map(provider => [
      provider.name,
      provider.email,
      provider.phoneNumber,
      provider.serviceArea,
      provider.serviceType,
      provider.description || "N/A",
      provider.status,
      formatDate(provider.createdAt)
    ]);
    
    // Add headers at the beginning
    csvData.unshift(headers);
    
    // Convert to CSV string
    const csvString = csvData.map(row => row.join(",")).join("\n");
    
    // Create and download the file
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "verified_providers.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Show success toast notification
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast-notification success';
    toast.innerHTML = 'CSV Downloaded Successfully!';
    toastContainer.appendChild(toast);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

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
          <li>
            <Link to="/service-provider-list"><FaUserClock /> Unverified Providers</Link>
          </li>
          <li className="active">
            <Link to="/verified-providers"><FaUserCheck /> Verified Providers</Link>
          </li>
          <li className="logout">
            <Link to="/"><FaSignOutAlt /> Logout</Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="content-container">
        <div className="content-header">
          <h2>Verified Service Providers</h2>
          <div className="action-container">
            <div className="search-container">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search by name, service type or area..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="search-icon" />
            </div>
            {verifiedProviders.length > 0 && (
              <button className="btn btn-export" onClick={exportToCSV}>
                <FaDownload /> Export CSV
              </button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading verified providers...</p>
          </div>
        ) : (
          <div className="row">
            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider) => (
                <div className="col-md-6 col-lg-4" key={provider._id}>
                  <div className="card service-card">
                    <div className="card-header">
                      <h5 className="card-title">{provider.name}</h5>
                      <span className="status-badge verified">Verified</span>
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
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 empty-state">
                <div className="empty-state-container">
                  <img src="/empty-state.svg" alt="No data" className="empty-state-img" />
                  <h3>No verified providers found</h3>
                  <p>There are no verified service providers at the moment.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewVerifyList;