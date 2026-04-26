import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Componets/CSS/ViewServiceProvider.css";
import {
  FaUserCheck, FaUserTimes, FaHome, FaUserClock,
  FaUserCheck as FaVerified, FaSignOutAlt, FaIdCard, FaBriefcase, FaSearch, FaShieldAlt
} from "react-icons/fa";

function ViewServiceProviders() {
  const [serviceProviders, setServiceProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [analyzeModalOpen, setAnalyzeModalOpen] = useState(false);
  const [analyzeProvider, setAnalyzeProvider] = useState(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState(null);

  useEffect(() => { fetchServiceProviders(); }, []);

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
      showToast("✅ Service Provider Verified Successfully!", "success");
      setServiceProviders(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      showToast("Failed to verify service provider.", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.delete(`http://localhost:8070/ServiceProvider/reject/${id}`);
      showToast("Service Provider Rejected", "warning");
      setServiceProviders(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      showToast("Failed to reject service provider.", "error");
    }
  };

  const showToast = (message, type = "error") => {
    const toastContainer = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredProviders = serviceProviders.filter(provider =>
    provider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.serviceArea?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.nicNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── AI ANALYZE ──
  const fetchImageAsBase64 = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(",")[1];
          resolve({ base64, mediaType: blob.type || "image/jpeg" });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Failed to fetch image as base64:", err);
      return null;
    }
  };

  const handleAnalyze = async (provider) => {
    setAnalyzeProvider(provider);
    setAnalyzeResult(null);
    setAnalyzeModalOpen(true);
    setAnalyzeLoading(true);

    try {
      const frontUrl = provider.nicFrontImage ? `http://localhost:8070/${provider.nicFrontImage.replace(/\\/g, "/")}` : null;
      const backUrl = provider.nicBackImage ? `http://localhost:8070/${provider.nicBackImage.replace(/\\/g, "/")}` : null;

      let frontImageData = null, backImageData = null;
      if (frontUrl) frontImageData = await fetchImageAsBase64(frontUrl);
      if (backUrl) backImageData = await fetchImageAsBase64(backUrl);

      const parts = [];
      if (frontImageData) parts.push({ inline_data: { mime_type: frontImageData.mediaType, data: frontImageData.base64 } });
      if (backImageData) parts.push({ inline_data: { mime_type: backImageData.mediaType, data: backImageData.base64 } });

      const today = new Date();
      const currentDateStr = today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

      const analysisPrompt = `You are a professional identity verification assistant. Today's date is ${currentDateStr}. Any ID or document issued on or before this date is valid and should NOT be flagged as a future issue date.

      Analyze the following service provider application and their submitted NIC (National Identity Card) images.
      
      SUBMITTED PROFILE DETAILS:
      - Full Name: ${provider.name || "N/A"}
      - NIC Number: ${provider.nicNumber || "N/A"}
      - Service Type: ${provider.serviceType || "N/A"}
      - Years of Experience: ${provider.yearsOfExperience || "N/A"} years
      - Service Area: ${provider.serviceArea || "N/A"}
      - Profile Description: ${provider.description && provider.description.trim() !== "" ? provider.description.trim() : "No description provided"}
      
      VERIFICATION TASKS:
      1. Compare the NIC card images against the submitted name and NIC number — check if they match.
      2. Assess the authenticity of the NIC images (look for signs of tampering, editing, or inconsistencies).
      3. Evaluate the profile description: is it professional, detailed, and relevant to the stated service type?
      4. Assess whether the years of experience claim is credible given the profile context.
      5. Note any red flags or positive indicators.

      IMPORTANT DATE RULE: Today is ${currentDateStr}. Do NOT flag any date on the ID as a future date unless it is strictly after today's date.
      
      Respond ONLY in this exact JSON format with no extra text:
      {
        "nicNameMatch": true/false/"unverifiable",
        "nicNumberMatch": true/false/"unverifiable",
        "nicImageAuthenticity": "genuine"/"suspicious"/"unverifiable",
        "nicImageNotes": "string",
        "descriptionQuality": "excellent"/"good"/"poor"/"missing",
        "descriptionNotes": "string",
        "experienceCredibility": "credible"/"questionable"/"insufficient",
        "experienceNotes": "string",
        "redFlags": [],
        "positives": [],
        "reliabilityScore": 0-100,
        "verdict": "Approved"/"Review Required"/"Reject",
        "summary": "2 sentence summary"
      }`;

      parts.push({ text: analysisPrompt });

      const API_KEY = "AIzaSyA8wvcLTrsff524vRt2XOj2ktkcD3sM0e4";
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { temperature: 0.2, topP: 0.8, topK: 40, responseMimeType: "application/json" }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const parsed = JSON.parse(rawText);
      setAnalyzeResult(parsed);
    } catch (err) {
      console.error("Analysis failed:", err);
      setAnalyzeResult({ error: "Analysis failed. " + err.message });
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const closeModal = () => {
    setAnalyzeModalOpen(false);
    setAnalyzeProvider(null);
    setAnalyzeResult(null);
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#22c55e";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const getVerdictStyle = (verdict) => {
    if (verdict === "Approved") return { backgroundColor: "#dcfce7", color: "#15803d" };
    if (verdict === "Review Required") return { backgroundColor: "#fef3c7", color: "#92400e" };
    return { backgroundColor: "#fee2e2", color: "#991b1b" };
  };

  const getBoolIcon = (val) => {
    if (val === true) return "✅";
    if (val === false) return "❌";
    return "❓";
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
          <li className="active">
            <Link to="/service-provider-list"><FaUserClock /><span>Unverified Providers</span></Link>
          </li>
          <li>
            <Link to="/service-provider-verify"><FaVerified /><span>Verified Providers</span></Link>
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
            <h2>Unverified Providers</h2>
            <p className="dashboard-date">{filteredProviders.length} pending review</p>
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
                <div className="col-md-6 col-lg-4 mb-4" key={provider._id}>
                  <div className="service-card">
                    <div className="card-header">
                      <div>
                        <h5 className="card-title">{provider.name}</h5>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{provider.serviceType}</p>
                      </div>
                      <span className={`status-badge ${provider.status === "verified" ? "verified" : "pending"}`}>
                        {provider.status || "Pending"}
                      </span>
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
                          <label><FaIdCard /> NIC</label>
                          <p><strong>{provider.nicNumber}</strong></p>
                        </div>
                        <div className="info-group">
                          <label><FaBriefcase /> Experience</label>
                          <p><strong>{provider.yearsOfExperience} yrs</strong></p>
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
                              <a href={`http://localhost:8070/${provider.nicFrontImage.replace(/\\/g, "/")}`} target="_blank" rel="noopener noreferrer">
                                <img src={`http://localhost:8070/${provider.nicFrontImage.replace(/\\/g, "/")}`} alt="NIC Front"
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
                              <a href={`http://localhost:8070/${provider.nicBackImage.replace(/\\/g, "/")}`} target="_blank" rel="noopener noreferrer">
                                <img src={`http://localhost:8070/${provider.nicBackImage.replace(/\\/g, "/")}`} alt="NIC Back"
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

                    {/* Actions */}
                    <div className="card-footer">
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-success flex-fill" onClick={() => handleAccept(provider._id)} style={{ flex: 1 }}>
                          <FaUserCheck /> Accept
                        </button>
                        <button className="btn btn-danger flex-fill" onClick={() => handleReject(provider._id)} style={{ flex: 1 }}>
                          <FaUserTimes /> Reject
                        </button>
                      </div>
                      <button className="btn btn-primary w-100" onClick={() => handleAnalyze(provider)}>
                        🔍 Analyze with AI
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="empty-state">
                  <div className="empty-state-container">
                    <div className="empty-icon">📋</div>
                    <h3>No unverified providers</h3>
                    <p>There are no service providers pending verification.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ANALYZE MODAL ── */}
      {analyzeModalOpen && (
        <div className="analyze-modal-overlay" onClick={closeModal}>
          <div className="analyze-modal" onClick={(e) => e.stopPropagation()}>
            <div className="analyze-modal-header">
              <div>
                <h3>📋 Provider Verification Report</h3>
                {analyzeProvider && (
                  <p className="analyze-provider-name">{analyzeProvider.name} — {analyzeProvider.nicNumber}</p>
                )}
              </div>
              <button className="analyze-close-btn" onClick={closeModal}>✕</button>
            </div>

            <div className="analyze-modal-body">
              {analyzeLoading && (
                <div className="analyze-loading">
                  <div className="analyze-spinner"></div>
                  <p>Analyzing NIC images and profile details...</p>
                  <span className="analyze-loading-hint">This may take 5–15 seconds</span>
                </div>
              )}

              {!analyzeLoading && analyzeResult?.error && (
                <div className="analyze-error"><p>⚠️ {analyzeResult.error}</p></div>
              )}

              {!analyzeLoading && analyzeResult && !analyzeResult.error && (
                <div className="analyze-results">
                  {/* Score + Verdict */}
                  <div className="analyze-score-row">
                    <div className="analyze-score-circle">
                      <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" className="score-bg" />
                        <circle cx="50" cy="50" r="42" className="score-fill"
                          style={{
                            stroke: getScoreColor(analyzeResult.reliabilityScore),
                            strokeDasharray: `${(analyzeResult.reliabilityScore / 100) * 264} 264`
                          }} />
                      </svg>
                      <div className="score-text">
                        <span className="score-number" style={{ color: getScoreColor(analyzeResult.reliabilityScore) }}>
                          {analyzeResult.reliabilityScore}
                        </span>
                        <span className="score-label">/ 100</span>
                      </div>
                    </div>
                    <div className="analyze-verdict-block">
                      <span className="analyze-verdict-badge" style={getVerdictStyle(analyzeResult.verdict)}>
                        {analyzeResult.verdict}
                      </span>
                      <p className="analyze-summary">{analyzeResult.summary}</p>
                    </div>
                  </div>

                  {/* NIC Verification */}
                  <div className="analyze-section">
                    <h4>🪪 NIC Verification</h4>
                    <div className="analyze-checks">
                      <div className="analyze-check-item">
                        <span>{getBoolIcon(analyzeResult.nicNameMatch)}</span>
                        <div>
                          <strong>Name Match</strong>
                          <p>{analyzeResult.nicImageNotes}</p>
                        </div>
                      </div>
                      <div className="analyze-check-item">
                        <span>{getBoolIcon(analyzeResult.nicNumberMatch)}</span>
                        <div><strong>NIC Number Match</strong></div>
                      </div>
                      <div className="analyze-check-item">
                        <span>{analyzeResult.nicImageAuthenticity === "genuine" ? "✅" : analyzeResult.nicImageAuthenticity === "suspicious" ? "⚠️" : "❓"}</span>
                        <div>
                          <strong>Image Authenticity</strong>
                          <p style={{ textTransform: "capitalize" }}>{analyzeResult.nicImageAuthenticity}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Credibility */}
                  <div className="analyze-section">
                    <h4>📋 Profile Credibility</h4>
                    <div className="analyze-checks">
                      <div className="analyze-check-item">
                        <span>{analyzeResult.descriptionQuality === "excellent" || analyzeResult.descriptionQuality === "good" ? "✅" : analyzeResult.descriptionQuality === "poor" ? "⚠️" : "❌"}</span>
                        <div>
                          <strong>Description Quality: <em style={{ textTransform: "capitalize" }}>{analyzeResult.descriptionQuality}</em></strong>
                          <p>{analyzeResult.descriptionNotes}</p>
                        </div>
                      </div>
                      <div className="analyze-check-item">
                        <span>{analyzeResult.experienceCredibility === "credible" ? "✅" : analyzeResult.experienceCredibility === "questionable" ? "⚠️" : "❌"}</span>
                        <div>
                          <strong>Experience: <em style={{ textTransform: "capitalize" }}>{analyzeResult.experienceCredibility}</em></strong>
                          <p>{analyzeResult.experienceNotes}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Red Flags & Positives */}
                  <div className="analyze-two-col">
                    {analyzeResult.redFlags?.length > 0 && (
                      <div className="analyze-flags">
                        <h4>🚩 Red Flags</h4>
                        <ul>{analyzeResult.redFlags.map((flag, i) => <li key={i}>{flag}</li>)}</ul>
                      </div>
                    )}
                    {analyzeResult.positives?.length > 0 && (
                      <div className="analyze-positives">
                        <h4>✅ Positive Indicators</h4>
                        <ul>{analyzeResult.positives.map((pos, i) => <li key={i}>{pos}</li>)}</ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewServiceProviders;