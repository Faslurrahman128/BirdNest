const express = require("express");
const router = express.Router();
const {
  getMyRooms,
  getBookedroom,
  addRoom,
  updateRoom,
  deleteRoom,
  getUnverifiedRooms,
  verifyRoom,
  getAllRooms,
  bookRoom,
  getOwnerBookings,
  buyerRating,
  repostRoom,
  verifyBookingconfirm,
  sendMessage,
  getChatHistory
  
  
} = require("../controllers/roomController");

const upload = require("../middlewares/upload");
const auth = require("../middlewares/auth");
const adminAuth = require("../middlewares/adminAuth");

// Public Routes
router.get("/all", getAllRooms); // Fetch all verified rooms

// Customer Routes
router.get("/myrooms", auth, getMyRooms);
router.get("/mybooking", auth, getBookedroom,);
router.post("/rate", buyerRating,);
router.post("/add", auth, upload.array("images", 10), addRoom);
router.put("/update/:id", auth, upload.array("images", 10), updateRoom);
router.delete("/delete/:id", auth, deleteRoom);

// Booking Routes (No need for image upload)
router.post("/book", auth, bookRoom); // Customers can book a room (No need for ":id" in URL)
router.put("/repost/:roomId", auth, repostRoom);
router.get("/owner/bookings", auth, getOwnerBookings); // Owners fetch bookings of their rooms
router.put("/confirmbooking/:id", auth, verifyBookingconfirm); // Owners fetch bookings of their rooms


router.post("/sendmessage", sendMessage,);
router.get("/chatHistory", auth, getChatHistory,);


// Admin Routes (Verification)
router.get("/unverified", adminAuth, getUnverifiedRooms);
router.put("/verify/:id", adminAuth, verifyRoom);

module.exports = router;

