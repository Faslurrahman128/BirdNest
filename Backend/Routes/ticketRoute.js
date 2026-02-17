const express = require("express");
const router = express.Router();
const { raiseTicket } = require("../controllers/ticketController");

// Route to create a new ticket
router.post("/raise", raiseTicket);

module.exports = router;
