import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import '../Componets/CSS/Register.css'
import logo from "../Componets/assets/unistaylogo.png";

function Addmember() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [Lname, setLName] = useState("");
  const [DOB, setDOB] = useState("");
  const [Gender, setGender] = useState("");
  const [Phonenumber1, setPhonenumber1] = useState("");
  const [Phonenumber2, setPhonenumber2] = useState("");
  const [Address, setAddress] = useState("");

  const navigate = useNavigate();

  function sendData(e) {
    e.preventDefault();

    if (!name || !Phonenumber1 || !email || !password) {
      alert("Please fill out all required fields (Name, Phone Number, Email, and Password).");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    const newCustomer = {
      name,
      email,
      password,
      Lname,
      DOB,
      Gender,
      Phonenumber1,
      Phonenumber2,
      Address,
    };

    axios.post("http://localhost:8070/Customer/add", newCustomer)
      .then(() => {
        alert("Registration successful!");
        
        axios.post("http://localhost:8070/send-email", { email, name })
          .then(() => {
            console.log("Email sent successfully");
          })
          .catch((err) => {
            console.error("Error sending email:", err);
          });

        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setLName("");
        setDOB("");
        setGender("");
        setPhonenumber1("");
        setPhonenumber2("");
        setAddress("");
        navigate("/Login");
      })
      .catch((err) => {
        console.error("Error during registration:", err);
        alert(err.response ? err.response.data.error : "An error occurred");
      });
  }

  return (
    <>
      <nav className="body">
        <nav className="navbar navbar-expand-lg">
          <div className="container">
            <div className="LOGO-container">
              <a className="nav-link text-warning" href="/">
                <img src={logo} alt="LOGO" width="130" />
              </a>
            </div>
            <a className="navbar-brand" href="/"></a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarContent">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item"><a className="nav-link" href="/">Home</a></li>
                <li className="nav-item"><a className="nav-link" href="/Login">Login</a></li>
              </ul>
            </div>
          </div>
        </nav>
        
        <div className="Registration-container-body">
          <div className="Registration-container">
            <h2 className="mt-1">Sign Up</h2>
            <form onSubmit={sendData}>
              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="firstname" className="form-label">First Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" id="firstname" placeholder="First name" onChange={(e) => setName(e.target.value)} value={name} required />
                </div>
                <div className="col">
                  <label htmlFor="Lastname" className="form-label">Last Name (opt)</label>
                  <input type="text" className="form-control" id="Lastname" placeholder="Last name" onChange={(e) => setLName(e.target.value)} value={Lname} />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="Phonenumber1" className="form-label">Phone Number 1 <span className="text-danger">*</span></label>
                  <input type="number" className="form-control" id="Phonenumber1" placeholder="Phone number" onChange={(e) => setPhonenumber1(e.target.value)} value={Phonenumber1} required />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="useremail" className="form-label">Email <span className="text-danger">*</span></label>
                <input type="email" className="form-control" id="useremail" placeholder="Email" onChange={(e) => setEmail(e.target.value)} value={email} required />
              </div>
              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="userpassword" className="form-label">Password <span className="text-danger">*</span></label>
                  <input type="password" className="form-control" id="userpassword" placeholder="Password" onChange={(e) => setPassword(e.target.value)} value={password} required />
                </div>
                <div className="col">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password <span className="text-danger">*</span></label>
                  <input type="password" className="form-control" id="confirmPassword" placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100">Register</button>
            </form>
            <div className="text-center mt-3">
              <p>Already have an account? <Link to="/Login" className="text-primary">Log in Now</Link></p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Addmember;
