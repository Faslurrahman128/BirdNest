const express = require("express");
const RoomController = require("../controllers/roomController");
const adminAuth = require("../middlewares/adminAuth");

const router = express.Router();

// Protect all routes under /admin using adminAuth middleware
router.use(adminAuth);

// Route to get all unverified rooms for admin
router.get("/unverified-rooms", RoomController.getUnverifiedRooms);

// Route to verify (approve/reject) a room for admin
router.put("/verify-room/:id", RoomController.verifyRoom);

module.exports = router;
