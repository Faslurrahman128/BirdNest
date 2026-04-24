import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Componets/CSS/ViewServiceProvider.css";
import {
  FaHome, FaUserClock, FaUserCheck, FaSignOutAlt,
  FaSearch, FaDownload, FaIdCard, FaBriefcase, FaTrash, FaShieldAlt
} from "react-icons/fa";

function ViewVerifyList() {
  const [verifiedProviders, setVerifiedProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { fetchVerifiedProviders(); }, []);

  const fetchVerifiedProviders = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8070/ServiceProvider/verified");
      setVerifiedProviders(response.data);
    } catch (error) {
      console.error("Error fetching verified providers", error);
      showToast("Failed to load verified service providers.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "error") => {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredProviders = verifiedProviders.filter(provider =>
    provider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.serviceArea?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.nicNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this verified service provider?")) return;
    try {
      await axios.delete(`http://localhost:8070/ServiceProvider/${id}`);
      showToast("✅ Service Provider Deleted Successfully!", "success");
      setVerifiedProviders(prev => prev.filter(provider => provider._id !== id));
    } catch (error) {
      console.error("Error deleting service provider", error);
      showToast("Failed to delete service provider.", "error");
    }
  };

  const exportToCSV = () => {
    if (verifiedProviders.length === 0) return;
    const headers = ["Name", "Email", "Phone", "NIC Number", "Experience", "Service Area", "Service Type", "Description", "Status", "Created At"];
    const csvData = verifiedProviders.map(provider => [
      provider.name, provider.email, provider.phoneNumber,
      provider.nicNumber || "N/A",
      provider.yearsOfExperience ? `${provider.yearsOfExperience} years` : "N/A",
      provider.serviceArea, provider.serviceType,
      provider.description || "N/A", provider.status, formatDate(provider.createdAt)
    ]);
    csvData.unshift(headers);
    const csvString = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "verified_providers.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast("CSV Downloaded Successfully!", "success");
  };

  return (
    <div className="dashboard-container">
      <div id="toast-container"></div>

      {/* Sidebar */}
      <nav className="dashboard-menu">
        <div className="dashboard-brand">
          <div className="brand-logo">
            <div className="brand-icon">
              <FaShieldAlt style={{ color: '#fff', fontSize: 18 }} />
            </div>
            <div>
              <h2>Agent Panel</h2>
              <p>Service Management</p>
            </div>
          </div>
        </div>
        <ul>
          <li>
            <Link to="/service-agent-dash"><FaHome /><span>Dashboard</span></Link>
          </li>
          <li>
            <Link to="/service-provider-list"><FaUserClock /><span>Unverified Providers</span></Link>
          </li>
          <li className="active">
            <Link to="/verified-providers"><FaUserCheck /><span>Verified Providers</span></Link>
          </li>
        </ul>
        <div className="sidebar-footer">
          <ul style={{ padding: 0 }}>
            <li className="logout">
              <Link to="/"><FaSignOutAlt /><span>Logout</span></Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main */}
      <div className="content-container">
        <div className="content-header">
          <div className="header-left">
            <h2>Verified Providers</h2>
            <p className="dashboard-date">{filteredProviders.length} providers found</p>
          </div>
          <div className="action-container">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, service, area or NIC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {verifiedProviders.length > 0 && (
              <button className="btn btn-primary btn-export" onClick={exportToCSV}>
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
                <div className="col-md-6 col-lg-4 mb-4" key={provider._id}>
                  <div className="service-card">
                    <div className="card-header">
                      <div>
                        <h5 className="card-title">{provider.name}</h5>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{provider.serviceType}</p>
                      </div>
                      <span className="status-badge verified">Verified</span>
                    </div>

                    <div className="card-body">
                      <div className="info-group">
                        <label>Email</label>
                        <p>{provider.email}</p>
                      </div>
                      <div className="info-group">
                        <label>Phone</label>
                        <p>{provider.phoneNumber}</p>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="info-group">
                          <label><FaIdCard /> NIC Number</label>
                          <p><strong>{provider.nicNumber || "N/A"}</strong></p>
                        </div>
                        <div className="info-group">
                          <label><FaBriefcase /> Experience</label>
                          <p><strong>{provider.yearsOfExperience ? `${provider.yearsOfExperience} yrs` : "N/A"}</strong></p>
                        </div>
                      </div>
                      <div className="info-group">
                        <label>Service Area</label>
                        <p>{provider.serviceArea}</p>
                      </div>
                      <div className="info-group">
                        <label>Description</label>
                        <p className="description">{provider.description || "N/A"}</p>
                      </div>
                      <div className="info-group">
                        <label>Joined</label>
                        <p>{formatDate(provider.createdAt)}</p>
                      </div>

                      {/* NIC Images */}
                      <div className="nic-images-section mt-3">
                        <label>NIC Card Images</label>
                        <div className="row g-2">
                          <div className="col-6">
                            <p className="small text-muted mb-1">Front</p>
                            {provider.nicFrontImage ? (
                              <a href={`http://localhost:8070/${provider.nicFrontImage.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">
                                <img src={`http://localhost:8070/${provider.nicFrontImage.replace(/\\/g, '/')}`} alt="NIC Front"
                                  className="nic-image img-fluid"
                                  style={{ maxHeight: 200, width: '100%', objectFit: 'cover', cursor: 'pointer' }}
                                  onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300x200?text=Not+Found"; }} />
                              </a>
                            ) : (
                              <div style={{ border: '1px dashed var(--border-strong)', borderRadius: 8, padding: 20, textAlign: 'center', background: 'var(--surface-2)' }}>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No Image</p>
                              </div>
                            )}
                          </div>
                          <div className="col-6">
                            <p className="small text-muted mb-1">Back</p>
                            {provider.nicBackImage ? (
                              <a href={`http://localhost:8070/${provider.nicBackImage.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">
                                <img src={`http://localhost:8070/${provider.nicBackImage.replace(/\\/g, '/')}`} alt="NIC Back"
                                  className="nic-image img-fluid"
                                  style={{ maxHeight: 200, width: '100%', objectFit: 'cover', cursor: 'pointer' }}
                                  onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300x200?text=Not+Found"; }} />
                              </a>
                            ) : (
                              <div style={{ border: '1px dashed var(--border-strong)', borderRadius: 8, padding: 20, textAlign: 'center', background: 'var(--surface-2)' }}>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No Image</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-footer">
                      <button className="btn btn-danger w-100" onClick={() => handleDelete(provider._id)}>
                        <FaTrash /> Delete Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="empty-state">
                  <div className="empty-state-container">
                    <div className="empty-icon">✓</div>
                    <h3>No verified providers found</h3>
                    <p>There are no verified service providers at the moment.</p>
                  </div>
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