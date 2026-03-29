const express = require("express");
const CustomerCareController = require("../controllers/CustomerCareController");
const customerCareAuth = require("../middlewares/customerCareAuth");

const router = express.Router();

// Public routes (no authentication required)
router.post("/login", CustomerCareController.login);
router.post("/register", CustomerCareController.register);

// Protected routes (require authentication)
router.use(customerCareAuth);
router.get("/feedbacks", CustomerCareController.getFeedbacks);
router.put("/feedbacks/respond/:id", CustomerCareController.respondFeedback);

module.exports = router;