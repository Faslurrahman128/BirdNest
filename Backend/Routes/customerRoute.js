const express = require("express");
const router = express.Router();
const {
  addCustomer,
  getCustomerDetails,
  updateCustomer,
  getAllCustomers,
  getCustomerById,
  deleteCustomer
} = require("../controllers/customerController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

// Public Routes
router.post("/add", addCustomer);

// Protected Routes (Require JWT Authentication)
router.get("/display", verifyToken, getCustomerDetails);
router.put("/update/:id", verifyToken, updateCustomer);
router.get("/get/:id", verifyToken, getCustomerById);
router.delete("/delete/:id", verifyToken, deleteCustomer);

// Admin Routes
router.get("/admin/displayall", verifyToken, verifyAdmin, getAllCustomers);

module.exports = router;
