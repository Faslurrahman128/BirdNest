import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function CustomerCareRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [Lname, setLName] = useState("");
  const [Phonenumber, setPhonenumber] = useState("");
  const [createdAt, setcreatedAt] = useState("");
  const navigate = useNavigate();

  function sendData(e) {
    e.preventDefault();

    if (!name || !Phonenumber || !email || !password) {
      alert("Please fill out all required fields (Name, Phone Number, Email, and Password).");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    const newCustomerCare = {
      name,
      email,
      password,
      Lname,
      Phonenumber,
      createdAt,
      role: "customerCare"
    };

    axios
      .post("http://localhost:8070/customer-care/register", newCustomerCare)
      .then((response) => {
        console.log("Registration response:", response.data);
        alert("Customer Care registration successful!");
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setLName("");
        setPhonenumber("");
        setcreatedAt("");
        navigate("/CustomerCareLogin");
      })
      .catch((err) => {
        console.error("Error during customer care registration:", err.response?.data || err.message);
        alert(err.response ? err.response.data.error : "An error occurred");
      });
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <a className="navbar-brand" href="/">Customer Care Portal</a>
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
        </div>
      </nav>

      <div className="Registration-container">
        <h2 className="mt-4">Customer Care Registration</h2>
        <form onSubmit={sendData}>
          <div className="row mb-3">
            <div className="col">
              <label htmlFor="firstname" className="form-label">
                First Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="firstname"
                placeholder="First name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
              />
            </div>
            <div className="col">
              <label htmlFor="Lastname" className="form-label">
                Last Name (opt)
              </label>
              <input
                type="text"
                className="form-control"
                id="Lastname"
                placeholder="Last name"
                onChange={(e) => setLName(e.target.value)}
                value={Lname}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col">
              <label htmlFor="Phonenumber1" className="form-label">
                Phone Number <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="Phonenumber1"
                placeholder="Phone number"
                onChange={(e) => setPhonenumber(e.target.value)}
                value={Phonenumber}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="useremail" className="form-label">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className="form-control"
              id="useremail"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>

          <div className="row mb-3">
            <div className="col">
              <label htmlFor="userpassword" className="form-label">
                Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                className="form-control"
                id="userpassword"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
            </div>
            <div className="col">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Register
          </button>
        </form>
        <div className="text-center mt-3">
          <p>
            Already a Customer Care Manager?{" "}
            <Link to="/CustomerCareLogin" className="text-primary">
              Customer Care Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default CustomerCareRegister;