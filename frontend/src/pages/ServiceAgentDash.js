import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import '../Componets/CSS/ViewServiceProvider.css';
import '../Componets/CSS/serviceAgentDash.css';
import { FaHome, FaUserClock, FaUserCheck, FaClipboardList, FaSignOutAlt, FaChartBar, FaCalendarAlt } from "react-icons/fa";

function ServiceAgentDash() {
  const [serviceTypeData, setServiceTypeData] = useState([]);
  const [dailyRegistrations, setDailyRegistrations] = useState([]);
  const [totalProviders, setTotalProviders] = useState(0);
  const [verifiedProviders, setVerifiedProviders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all required data when component mounts
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch service type distribution data
        const serviceTypeRes = await axios.get("http://localhost:8070/ServiceProvider/service-type-counts");
        setServiceTypeData(serviceTypeRes.data);
        
        // Calculate total number of providers
        const totalCount = serviceTypeRes.data.reduce((sum, item) => sum + item.count, 0);
        setTotalProviders(totalCount);

        // Fetch daily registration data
        const dailyRegRes = await axios.get("http://localhost:8070/ServiceProvider/daily-registrations");
        setDailyRegistrations(dailyRegRes.data);

        // Fetch verified providers count
        const verifiedRes = await axios.get("http://localhost:8070/ServiceProvider/verified");
        setVerifiedProviders(verifiedRes.data.length);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        
        // Show error toast notification
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast-notification error';
        toast.innerHTML = 'Failed to load dashboard data. Please try again later.';
        toastContainer.appendChild(toast);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
          toast.remove();
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Get colors for service types
  const getServiceTypeColor = (index) => {
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#a4de6c', '#d0ed57'];
    return colors[index % colors.length];
  };

  // Format date for better display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
          <li className="active">
            <Link to="/service-agent-dash"><FaHome /> Dashboard</Link>
          </li>
          <li>
            <Link to="/service-provider-list"><FaUserClock /> Unverified Providers</Link>
          </li>
          <li>
            <Link to="/service-provider-verify"><FaUserCheck /> Verified Providers</Link>
          </li>
          <li className="logout">
            <Link to="/"><FaSignOutAlt /> Logout</Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="content-container">
        <div className="content-header">
          <h2>Service Agent Dashboard</h2>
          <p className="dashboard-date">Today: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button className="btn btn-retry" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Stats Summary Cards */}
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-card-icon total">
                  <FaUserClock />
                </div>
                <div className="stat-card-content">
                  <h3>Total Providers</h3>
                  <p className="stat-value">{totalProviders}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-card-icon verified">
                  <FaUserCheck />
                </div>
                <div className="stat-card-content">
                  <h3>Verified Providers</h3>
                  <p className="stat-value">{verifiedProviders}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-card-icon pending">
                  <FaUserClock />
                </div>
                <div className="stat-card-content">
                  <h3>Pending Verification</h3>
                  <p className="stat-value">{totalProviders - verifiedProviders}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-card-icon recent">
                  <FaCalendarAlt />
                </div>
                <div className="stat-card-content">
                  <h3>Recent Sign-ups</h3>
                  <p className="stat-value">
                    {dailyRegistrations.length > 0
                      ? dailyRegistrations[dailyRegistrations.length - 1].count
                      : 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Service Type Distribution Section */}
            <div className="chart-section">
              <div className="section-header">
                <h3><FaChartBar /> Service Type Distribution</h3>
              </div>
              <div className="simple-chart">
                {serviceTypeData.map((item, index) => (
                  <div key={index} className="chart-item">
                    <div className="chart-label">
                      <span 
                        className="color-box" 
                        style={{ backgroundColor: getServiceTypeColor(index) }}
                      ></span>
                      <span className="service-type-name">{item.serviceType}</span>
                    </div>
                    <div className="chart-bar-container">
                      <div 
                        className="chart-bar" 
                        style={{ 
                          width: `${(item.count / totalProviders) * 100}%`,
                          backgroundColor: getServiceTypeColor(index)
                        }}
                      ></div>
                      <span className="chart-value">{item.count} ({((item.count / totalProviders) * 100).toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Registrations Table */}
            <div className="registration-section">
              <div className="section-header">
                <h3><FaCalendarAlt /> Recent Daily Registrations</h3>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Number of Registrations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyRegistrations.slice(-7).map((day, index) => (
                      <tr key={index}>
                        <td>{formatDate(day.date)}</td>
                        <td>
                          <div className="registration-count">
                            <div 
                              className="registration-bar"
                              style={{ 
                                width: `${Math.min((day.count / 10) * 100, 100)}%`,
                                backgroundColor: '#3498db'
                              }}
                            ></div>
                            <span>{day.count}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ServiceAgentDash;