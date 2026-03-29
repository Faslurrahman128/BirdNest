import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UpdateCustomer({ customer, onClose }) {
  const [updatedCustomer, setUpdatedCustomer] = useState(customer);
  const navigate = useNavigate();

  useEffect(() => {
    setUpdatedCustomer(customer);
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedCustomer((prevCustomer) => ({
      ...prevCustomer,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("You are not logged in!");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8070/customer/update/${customer._id}`,
        updatedCustomer,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        alert("Details updated successfully!");
        onClose(); // Close the modal
      } else {
        alert("Failed to update details.");
      }
    } catch (error) {
      console.error("Error updating customer details:", error.message);
      alert("Failed to update details.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="name" className="form-label">
            First Name
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={updatedCustomer.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col">
          <label htmlFor="Lname" className="form-label">
            Last Name
          </label>
          <input
            type="text"
            className="form-control"
            id="Lname"
            name="Lname"
            value={updatedCustomer.Lname}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="row mb-3">
        <label htmlFor="Gender" className="form-label">
          Gender
        </label>
        <select
          id="Gender"
          name="Gender"
          value={updatedCustomer.Gender}
          onChange={handleChange}
          className="form-control"
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="row mb-3">
        <label htmlFor="Phonenumber" className="form-label">
          Phone Number
        </label>
        <input
          type="text"
          className="form-control"
          id="Phonenumber"
          name="Phonenumber"
          value={updatedCustomer.Phonenumber}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="Address" className="form-label">
          Address
        </label>
        <input
          type="text"
          className="form-control"
          id="Address"
          name="Address"
          value={updatedCustomer.Address}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          type="email"
          className="form-control"
          id="email"
          name="email"
          value={updatedCustomer.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="row mb-3">
        <div className="col">
          <label htmlFor="password" className="form-label">
            New Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={updatedCustomer.password || ""}
            onChange={handleChange}
          />
        </div>

        <div className="col">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            name="confirmPassword"
            value={updatedCustomer.confirmPassword || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary w-100">
        Update
      </button>
    </form>
  );
}

export default UpdateCustomer;
