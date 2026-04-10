import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../Componets/CSS/AddRoom.css'
import '../Componets/CSS/MyListings.css'
import logo from "../Componets/assets/unistaylogo.png";

function AddRoom() {
  const [roomAddress, setRoomAddress] = useState("");
  const [roomCity, setRoomCity] = useState("");
  const [roomType, setRoomType] = useState("");
  const [price, setPrice] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [ownerContactNumber, setOwnerContactNumber] = useState("");
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Validation error states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // City options
  const cities = [
    "Colombo", "Kandy", "Galle", "Negombo", "Jaffna", "Kurunegala",
    "Ratnapura", "Badulla", "Batticaloa","Ampara", "Trincomalee", "Anuradhapura",
    "Polonnaruwa", "Matara", "Nuwara Eliya", "Other"
  ];

  // Price suggestions based on room type
  const priceSuggestions = {
    "Single Room": { min: 10000, max: 35000 },
    "Shared Room": { min: 8000, max: 20000 },
    "Anex": { min: 25000, max: 60000 },
    "Apartment": { min: 40000, max: 150000 }
  };

  // Validate mobile number
  const validateMobileNumber = (number) => {
    const mobileRegex = /^(?:\+94|0)?[7-9][0-9]{8}$/;
    if (!number) return "Mobile number is required";
    if (!mobileRegex.test(number)) return "Enter valid number (e.g., 0712345678 or +94712345678)";
    return "";
  };

  // Validate price
  const validatePrice = (priceValue) => {
    if (!priceValue) return "Price is required";
    const numPrice = parseFloat(priceValue.replace(/,/g, ''));
    if (isNaN(numPrice)) return "Enter a valid number";
    if (numPrice < 1000) return "Price must be at least LKR 1,000";
    if (numPrice > 1000000) return "Price cannot exceed LKR 1,000,000";
    
    // Price suggestion validation
    if (roomType && priceSuggestions[roomType]) {
      const { min, max } = priceSuggestions[roomType];
      if (numPrice < min) return `Price seems low for ${roomType} (typical range: LKR ${min.toLocaleString()} - ${max.toLocaleString()})`;
      if (numPrice > max) return `Price seems high for ${roomType} (typical range: LKR ${min.toLocaleString()} - ${max.toLocaleString()})`;
    }
    return "";
  };

  // Validate owner name
  const validateOwnerName = (name) => {
    if (!name) return "Owner name is required";
    if (name.length < 3) return "Name must be at least 3 characters";
    if (!/^[a-zA-Z\s]*$/.test(name)) return "Name can only contain letters and spaces";
    return "";
  };

  // Validate address
  const validateAddress = (address) => {
    if (!address) return "Address is required";
    if (address.length < 10) return "Please enter a complete address (min 10 characters)";
    return "";
  };

  // Validate description
  const validateDescription = (desc) => {
    if (!desc) return "Description is required";
    if (desc.length < 10) return "Description must be at least 10 characters";
    if (desc.length > 500) return "Description cannot exceed 500 characters";
    return "";
  };

  // Validate images
  const validateImages = (imageList) => {
    if (imageList.length === 0) return "Please upload at least 1 image";
    if (imageList.length > 10) return "Maximum 10 images allowed";
    
    // Check file sizes (max 5MB each)
    for (let img of imageList) {
      if (img.size > 5 * 1024 * 1024) {
        return `Image "${img.name}" exceeds 5MB limit`;
      }
    }
    return "";
  };

  // Validate all fields
  const validateField = (name, value) => {
    switch (name) {
      case "ownerName": return validateOwnerName(value);
      case "ownerContactNumber": return validateMobileNumber(value);
      case "roomAddress": return validateAddress(value);
      case "roomCity": return !value ? "City is required" : "";
      case "roomType": return !value ? "Room type is required" : "";
      case "price": return validatePrice(value);
      case "description": return validateDescription(value);
      case "images": return validateImages(value);
      default: return "";
    }
  };

  // Handle field blur
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, eval(field));
    setErrors({ ...errors, [field]: error });
  };

  // Format price with commas
  const formatPrice = (value) => {
    const numValue = value.replace(/[^0-9]/g, '');
    if (!numValue) return "";
    return parseInt(numValue, 10).toLocaleString('en-IN');
  };

  const handlePriceChange = (e) => {
    const formatted = formatPrice(e.target.value);
    setPrice(formatted);
    const error = validatePrice(formatted);
    setErrors({ ...errors, price: error });
  };

  const handleMobileChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setOwnerContactNumber(digitsOnly);
    const error = validateMobileNumber(digitsOnly);
    setErrors({ ...errors, ownerContactNumber: error });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    handleImageValidation(files);
  };

  const handleImageValidation = (files) => {
    if (images.length + files.length > 10) {
      alert("You can upload a maximum of 10 images.");
      return;
    }

    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`Some files exceed 5MB limit: ${oversizedFiles.map(f => f.name).join(", ")}`);
      return;
    }

    setImages((prevImages) => [...prevImages, ...files]);
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    
    const error = validateImages([...images, ...files]);
    setErrors({ ...errors, images: error });
  };

  const removeImage = (index) => {
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
    
    const error = validateImages(images.filter((_, i) => i !== index));
    setErrors({ ...errors, images: error });
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    handleImageValidation(files);
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  const handleAgreeToTermsChange = (e) => {
    setAgreeToTerms(e.target.checked);
  };

  // Check if form is valid
  const isFormValid = () => {
    const requiredFields = {
      ownerName, ownerContactNumber, roomAddress, roomCity, roomType, price, description, images
    };
    
    for (let [key, value] of Object.entries(requiredFields)) {
      if (!value || (key === "images" && value.length === 0)) return false;
      const error = validateField(key, value);
      if (error) return false;
    }
    return agreeToTerms;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Touch all fields to show errors
    const allFields = ["ownerName", "ownerContactNumber", "roomAddress", "roomCity", "roomType", "price", "description", "images"];
    const newTouched = {};
    const newErrors = {};
    
    allFields.forEach(field => {
      newTouched[field] = true;
      const value = eval(field);
      const error = validateField(field, value);
      if (error) newErrors[field] = error;
    });
    
    setTouched(newTouched);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      alert("Please fix the errors before submitting.");
      return;
    }
    
    if (!agreeToTerms) {
      alert("Please agree to the Terms and Conditions.");
      return;
    }
    
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to add a room.");
      return;
    }
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("roomAddress", roomAddress);
    formData.append("roomCity", roomCity);
    formData.append("roomType", roomType);
    formData.append("price", price.replace(/,/g, ''));
    formData.append("isNegotiable", isNegotiable.toString());
    formData.append("ownerName", ownerName);
    formData.append("ownerContactNumber", ownerContactNumber);
    formData.append("description", description);
    images.forEach((image) => formData.append("images", image));
    
    try {
      const response = await axios.post("http://localhost:8070/Room/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("✓ Room added successfully!");
      navigate("/MyListings");
      
      // Reset form
      setRoomAddress("");
      setRoomCity("");
      setRoomType("");
      setPrice("");
      setIsNegotiable(false);
      setOwnerName("");
      setOwnerContactNumber("");
      setImages([]);
      setImagePreviewUrls([]);
      setDescription("");
      setAgreeToTerms(false);
      setErrors({});
      setTouched({});
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Error adding the room. Please try again later.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  // Helper function to get field value for validation
  const getFieldValue = (field) => {
    switch(field) {
      case "ownerName": return ownerName;
      case "ownerContactNumber": return ownerContactNumber;
      case "roomAddress": return roomAddress;
      case "roomCity": return roomCity;
      case "roomType": return roomType;
      case "price": return price;
      case "description": return description;
      case "images": return images;
      default: return "";
    }
  };

  return (
    <div className="listings-body">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <div className="LOGO-container">
            <a className="nav-link" href="/">
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
                  {sessionStorage.getItem("token") && (
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}><strong>Logout</strong></button>
                    </li>
                  )}
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      
      <div className="Postadd-container-body">
        <div className="Postadd-container">
          {/* Progress Indicator */}
          <div className="progress-indicator">
            <div className="progress-step active">1</div>
            <div className="progress-line"></div>
            <div className={`progress-step ${roomType && roomCity ? "active" : ""}`}>2</div>
            <div className="progress-line"></div>
            <div className={`progress-step ${price && images.length > 0 ? "active" : ""}`}>3</div>
          </div>
          
          <h2 className="mt-1">🏠 Add a Room</h2>
          <p>Please fill out the form below to post your room. Provide accurate details for better visibility.</p>
          
          <form onSubmit={handleSubmit}>
            {/* Owner Information Section */}
            <div className="form-section">
              <h4 className="section-title">👤 Owner Information</h4>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="ownerName" className="form-label">
                    Owner Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${touched.ownerName && errors.ownerName ? 'is-invalid' : touched.ownerName && !errors.ownerName ? 'is-valid' : ''}`}
                    id="ownerName"
                    placeholder="Enter full name"
                    value={ownerName}
                    onChange={(e) => {
                      setOwnerName(e.target.value);
                      const error = validateOwnerName(e.target.value);
                      setErrors({ ...errors, ownerName: error });
                    }}
                    onBlur={() => handleBlur("ownerName")}
                    required
                  />
                  {touched.ownerName && errors.ownerName && (
                    <div className="invalid-feedback">{errors.ownerName}</div>
                  )}
                  <small className="text-muted">Use your real name for tenant trust</small>
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="ownerContactNumber" className="form-label">
                    Contact Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    className={`form-control ${touched.ownerContactNumber && errors.ownerContactNumber ? 'is-invalid' : touched.ownerContactNumber && !errors.ownerContactNumber ? 'is-valid' : ''}`}
                    id="ownerContactNumber"
                    placeholder="0712345678"
                    value={ownerContactNumber}
                    onChange={handleMobileChange}
                    onBlur={() => handleBlur("ownerContactNumber")}
                    required
                  />
                  {touched.ownerContactNumber && errors.ownerContactNumber && (
                    <div className="invalid-feedback">{errors.ownerContactNumber}</div>
                  )}
                  <small className="text-muted">Enter with country code for international numbers</small>
                </div>
              </div>
            </div>

            {/* Room Details Section */}
            <div className="form-section" style={{ height: '620px' }}>
              <h4 className="section-title">🏘️ Room Details</h4>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="roomType" className="form-label">
                    Room Type <span className="text-danger">*</span>
                  </label>
                  <select style={{ height: '50px' }}
                    className={`form-control ${touched.roomType && errors.roomType ? 'is-invalid' : touched.roomType && !errors.roomType ? 'is-valid' : ''}`}
                    id="roomType"
                    value={roomType}
                    onChange={(e) => {
                      setRoomType(e.target.value);
                      const error = validateField("roomType", e.target.value);
                      setErrors({ ...errors, roomType: error });
                      // Re-validate price when room type changes
                      if (price) {
                        const priceError = validatePrice(price);
                        setErrors({ ...errors, price: priceError });
                      }
                    }}
                    onBlur={() => handleBlur("roomType")}
                    required
                  >
                    <option value="">Select Room Type</option>
                    <option value="Single Room">🏠 Single Room</option>
                    <option value="Shared Room">👥 Shared Room</option>
                    <option value="Anex">🏡 Anex</option>
                    <option value="Apartment">🏢 Apartment</option>
                  </select>
                  {touched.roomType && errors.roomType && (
                    <div className="invalid-feedback">{errors.roomType}</div>
                  )}
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="roomCity" className="form-label">
                    City <span className="text-danger">*</span>
                  </label>
                  <select style={{ height: '50px' }}
                    className={`form-control ${touched.roomCity && errors.roomCity ? 'is-invalid' : touched.roomCity && !errors.roomCity ? 'is-valid' : ''}`}
                    id="roomCity"
                    value={roomCity}
                    onChange={(e) => {
                      setRoomCity(e.target.value);
                      const error = validateField("roomCity", e.target.value);
                      setErrors({ ...errors, roomCity: error });
                    }}
                    onBlur={() => handleBlur("roomCity")}
                    required
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {touched.roomCity && errors.roomCity && (
                    <div className="invalid-feedback">{errors.roomCity}</div>
                  )}
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="roomAddress" className="form-label">
                  Full Address <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${touched.roomAddress && errors.roomAddress ? 'is-invalid' : touched.roomAddress && !errors.roomAddress ? 'is-valid' : ''}`}
                  id="roomAddress"
                  placeholder="Street name, area, landmarks"
                  value={roomAddress}
                  onChange={(e) => {
                    setRoomAddress(e.target.value);
                    const error = validateAddress(e.target.value);
                    setErrors({ ...errors, roomAddress: error });
                  }}
                  onBlur={() => handleBlur("roomAddress")}
                  required
                />
                {touched.roomAddress && errors.roomAddress && (
                  <div className="invalid-feedback">{errors.roomAddress}</div>
                )}
                <small className="text-muted">Include nearby landmarks for easy finding</small>
              </div>
              
              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Room Description <span className="text-danger">*</span>
                </label>
                <textarea
                  className={`form-control ${touched.description && errors.description ? 'is-invalid' : touched.description && !errors.description ? 'is-valid' : ''}`}
                  id="description"
                  rows="4"
                  placeholder="Describe the room, amenities, nearby facilities, transport access, etc."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    const error = validateDescription(e.target.value);
                    setErrors({ ...errors, description: error });
                  }}
                  onBlur={() => handleBlur("description")}
                  required
                ></textarea>
                {touched.description && errors.description && (
                  <div className="invalid-feedback">{errors.description}</div>
                )}
                <div className="char-counter">
                  <small className={description.length > 500 ? "text-danger" : "text-muted"}>
                    {description.length}/500 characters
                  </small>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="form-section">
              <h4 className="section-title">💰 Pricing</h4>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="price" className="form-label">
                    Monthly Rent (LKR) <span className="text-danger">*</span>
                  </label>
                  <div className="price-input-wrapper">
                    <span className="currency-symbol">Rs.</span>
                    <input
                      type="text"
                      className={`form-control ${touched.price && errors.price ? 'is-invalid' : touched.price && !errors.price ? 'is-valid' : ''}`}
                      id="price"
                      placeholder="25,000"
                      value={price}
                      onChange={handlePriceChange}
                      onBlur={() => handleBlur("price")}
                      required
                    />
                  </div>
                  {touched.price && errors.price && (
                    <div className="invalid-feedback d-block">{errors.price}</div>
                  )}
                  {roomType && priceSuggestions[roomType] && (
                    <small className="text-muted">
                      Typical range: LKR {priceSuggestions[roomType].min.toLocaleString()} - {priceSuggestions[roomType].max.toLocaleString()}
                    </small>
                  )}
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Price Negotiable</label>
                  <div className="negotiable-group">
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="negotiableYes"
                        name="negotiable"
                        value="true"
                        className="form-check-input"
                        checked={isNegotiable === true}
                        onChange={() => setIsNegotiable(true)}
                      />
                      <label htmlFor="negotiableYes" className="form-check-label">
                        YES
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        id="negotiableNo"
                        name="negotiable"
                        value="false"
                        className="form-check-input"
                        checked={isNegotiable === false}
                        onChange={() => setIsNegotiable(false)}
                      />
                      <label htmlFor="negotiableNo" className="form-check-label">
                         NO
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="form-section">
              <h4 className="section-title">📸 Room Photos</h4>
              <div className="mb-3">
                <label className="form-label">
                  Upload Images (1-10) <span className="text-danger">*</span>
                </label>
                
                {/* Drag & Drop Zone */}
                <div
                  className={`drag-drop-zone ${dragActive ? "drag-active" : ""} ${touched.images && errors.images ? 'border-danger' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('imageInput').click()}
                >
                  <input
                    type="file"
                    id="imageInput"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <div className="drag-drop-content">
                    <span className="drag-icon">📷</span>
                    <p>Drag & drop images here or click to browse</p>
                    <small>Supported: JPG, PNG, GIF (Max 5MB each)</small>
                  </div>
                </div>
                
                {touched.images && errors.images && (
                  <div className="text-danger mt-2 small">{errors.images}</div>
                )}
                
                {/* Image Preview Grid */}
                {imagePreviewUrls.length > 0 && (
                  <div className="image-preview-grid">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={url} alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeImage(index)}
                        >
                          ✕
                        </button>
                        <span className="image-number">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
                <small className="text-muted">
                  {images.length}/10 images uploaded
                </small>
              </div>
            </div>

            {/* Terms and Submit */}
            <div className="form-section">
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="termsCheckbox"
                  checked={agreeToTerms}
                  onChange={handleAgreeToTermsChange}
                />
                <label className="form-check-label" htmlFor="termsCheckbox">
                  I agree to the <strong>Terms and Conditions</strong>
                </label>
              </div>
              <div className="terms-hint">
                <small><a href="/Terms">📖 Read full Terms and Conditions</a></small>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={!agreeToTerms || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Publishing...
                  </>
                ) : (
                  "✓ Add to Listings"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddRoom;