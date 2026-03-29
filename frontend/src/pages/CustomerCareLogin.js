import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import '../Componets/CSS/CustomerCareLogin.css';

const CustomerCareLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const navigate = useNavigate();

  const handleCustomerCareLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8070/customer-care/login", { email, password });
      setMessage(`Welcome back, ${response.data.username}!`);
      setAlertType("success");
      sessionStorage.setItem("customerCareToken", response.data.token);
      navigate("/CustomerCareDashboard", { state: { message: `Welcome, ${response.data.username}!`, alertType: "success" } });
    } catch (err) {
      setMessage(err?.response?.data?.error || "Customer Care login failed!");
      setAlertType("danger");
    }
  };

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

      <div className="Login-container">
        <h2 className="heading">Customer Care Login</h2>
        <form onSubmit={handleCustomerCareLogin} className="w-70 mx-auto mt-4">
          <div className="mb-3">
            <label htmlFor="email" className="AdminLoginform-label">Email:</label>
            <input
              type="email"
              className="AdminLoginform-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="AdminLoginform-label">Password:</label>
            <input
              type="password"
              className="AdminLoginform-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="AdminLoginbtn w-100">Login</button>
        </form>

        {message && (
          <div className={`alert alert-${alertType} mt-4`} role="alert">
            {message}
          </div>
        )}
        <div className="text-center mt-3">
          <p>
            Not a Customer Care Manager?{" "}
            <Link to="/CustomerCareRegister" className="text-primary">
              Customer Care Registration
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default CustomerCareLogin;