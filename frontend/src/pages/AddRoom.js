import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../Componets/CSS/AddRoom.css'
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
  const [agreeToTerms, setAgreeToTerms] = useState(false); // Track if user agrees to terms

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > 10) {
      alert("You can upload a maximum of 10 images.");
      return;
    }

    setImages((prevImages) => [...prevImages, ...files]);
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleAgreeToTermsChange = (e) => {
    setAgreeToTerms(e.target.checked); // Update the agreement state
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const token = sessionStorage.getItem("token");
  
    if (!token) {
      alert("You must be logged in to add a room.");
      return;
    }
  
    if (
      
      !roomAddress ||
      !roomCity||
      !roomType ||
      !price ||
      !ownerName ||
      !ownerContactNumber ||
      images.length < 1 ||
      images.length > 10 ||
      !description
    ) {
      alert("Please fill out all required fields and upload between 1 and 10 images.");
      return;
    }
  
    const formData = new FormData();
    formData.append("roomAddress", roomAddress);
    formData.append("roomCity", roomCity);
    formData.append("roomType", roomType);
    formData.append("price", price);
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
      alert(response.data.message);
  
      // Navigate to DisplayRoom page upon success
      navigate("/MyListings");
  
      // Reset form fields
      setRoomAddress("");
      setRoomCity("");
      setRoomType("");
      setPrice("");
      setIsNegotiable(false);
      setOwnerName("");
      setOwnerContactNumber("");
      setImages([]);
      setDescription("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Error adding the room. Please try again later.";
      alert(errorMessage);
    }
  };
  
   // Logout function
   const handleLogout = () => {
    // Remove token from sessionStorage
    sessionStorage.removeItem("token");
    // Redirect to login page
    navigate("/login", { replace: true });
  };

  return (
  <>
  
     {/* Navigation Bar and Welcome Section Combined */}
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
                <a className="nav-link" href="/">About Us</a>
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
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="/MyRoom">My Room</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="/MyListings">My Listings</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="/register-service-provider">Service Provider</a></li>
                  <li><a className="dropdown-item" href="/saved-providers">Bookmarks</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                  {sessionStorage.getItem("token") && (
                  <li className="nav-item">
                    <button className="dropdown-item" onClick={handleLogout}><strong>Logout</strong></button>
                  </li>
                )}
                  </li>
                </ul>
              </li>

              
            </ul>
          </div>

          </div>
        </div>
   
   <div className="Postadd-container-body">
    <div className="Postadd-container">
      <h2 className="mt-1">Add a Room</h2>
      <p>
        Please fill out the form below to Post your room. Provide accurate details to ensure better
        visibility for prospective tenants.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="row mb-2">
          <div className="col">
            <label htmlFor="roomType" className="form-label">
              Room Type <span className="text-danger">*</span>
            </label>
            <select
              className="form-control"
              id="roomType"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              required
            >
              <option value="">Select Room Type</option>
              <option value="Single Room">Single Room</option>
              <option value="Shared Room">Shared Room</option>
              <option value="Anex">Anex</option>
              <option value="Apartment">Apartment</option>
            </select>
          </div>
        </div>
        <div className="row mb-3">
          <div className="col">
            <label htmlFor="ownerName" className="form-label">
              Owner Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="ownerName"
              placeholder="Name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
            />
          </div>
          <div className="col">
            <label htmlFor="ownerContactNumber" className="form-label">
              Owner Contact Number <span className="text-danger">*</span>
            </label>
            <input
              type="tel"
              className="form-control"
              id="ownerContactNumber"
              placeholder="Contact Number"
              value={ownerContactNumber}
              onChange={(e) => setOwnerContactNumber(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col">
            <label htmlFor="roomAddress" className="form-label">
              Room Address <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="roomAddress"
              placeholder="Enter the Address"
              value={roomAddress}
              onChange={(e) => setRoomAddress(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col">
            <label htmlFor="roomCity" className="form-label">
              Room City <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="roomCity"
              placeholder="Enter the City"
              value={roomCity}
              onChange={(e) => setRoomCity(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Room Description<span className="text-danger">*</span>
          </label>
          <textarea
            className="form-control"
            id="description"
            rows="5"
            placeholder="Provide a description for the room (add landmarks)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="row mb-3">
          <div className="col">
            <label htmlFor="price" className="form-label">
              Price (per month) <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="price"
              placeholder="Enter the price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Price Negotiable</label>
            <div>
              <input
                type="radio"
                id="negotiableYes"
                name="negotiable"
                value="true"
                checked={isNegotiable === true}
                onChange={() => setIsNegotiable(true)}
              />
              <label htmlFor="negotiableYes" className="ms-2">
                Yes
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="negotiableNo"
                name="negotiable"
                value="false"
                checked={isNegotiable === false}
                onChange={() => setIsNegotiable(false)}
              />
              <label htmlFor="negotiableNo" className="ms-2">
                No
              </label>
            </div>
          </div>
        </div>
        <div className="row mb-3">
          <div className="col">
            <label htmlFor="images" className="form-label">
              Room Photos (1-10 images) <span className="text-danger">*</span>
            </label>
            <input
              type="file"
              className="form-control"
              id="images"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              required
            />
            <div className="mt-2">
              {images.length > 0 &&
                images.map((image, index) => (
                  <div key={index} className="d-flex align-items-center">
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Room Preview"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        marginRight: "10px",
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeImage(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        
          {/* Agreement Checkbox */}
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={agreeToTerms}
              onChange={handleAgreeToTermsChange}
            />
            <label className="form-check-label">
              I agree to the <strong >Terms and Conditions</strong>
              <h6><a href="/Terms">Terms and Conditions</a></h6>
            </label>
          </div>

        {/* Disable booking button if terms are not agreed */}
        <button
            className="btn btn-primary mt-3"
            disabled={!agreeToTerms}
          >
           Add to Listings
          </button>
      </form>
    </div>
    </div>

    </>
  );
}

export default AddRoom;
