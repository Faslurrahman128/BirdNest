const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServiceProviderSchema = new Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  phoneNumber: { 
    type: String, 
    required: true 
  },
  nicNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  yearsOfExperience: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  serviceArea: { type: String, required: true },
  serviceType: { type: String, required: true },
  description: { type: String },

  // NEW: NIC Images
  nicFrontImage: { 
    type: String, 
    required: true 
  }, // Cloudinary or local path URL
  nicBackImage: { 
    type: String, 
    required: true 
  },

  createdAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['unverified', 'verified'], 
    default: 'unverified' 
  }
});

module.exports = mongoose.model('ServiceProvider', ServiceProviderSchema);