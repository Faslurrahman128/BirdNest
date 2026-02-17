const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomAddress: { type: String, required: true },
    roomCity: { type: String, required: true },
    roomType: { type: String, required: true },
    price: { type: Number, required: true },
    isNegotiable: { type: Boolean, required: true },
    ownerName: { type: String, required: true },
    ownerContactNumber: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isVerified: { type: Boolean, default: false },
    isBooked: { type: Boolean, default: false },
    isBookedconfirm: { type: Boolean, default: false },
    buyerContactNumber: { type: String },
    buyerNIC: { type: String },
    buyingDate: { type: Date },
    buyingDuration: { type: Number },
    buyerName: { type: String },
    buyerCustomerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Embedded rating history schema
    ratingHistory: [
      {
        buyerName: { type: String },
        rating: { type: Number, min: 1, max: 5, required: true },
        description: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Modified chat system between customer and buyerCustomer
    chatHistory: [
      {
        Name: { type: String },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
