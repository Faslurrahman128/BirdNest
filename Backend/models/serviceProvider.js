const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for ServiceProvider
const ServiceProviderSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
  },
  phoneNumber: {
    type: String,
    required: true
  },
  serviceArea: {
    type: String,
    required: true
  }, // Location or area where service is provided
  serviceType: {
    type: String,
    required: true
  }, // Type of service offered
  description: {
    type: String,
    required: false
  }, // Additional details about the service
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['unverified', 'verified'],
    default: 'unverified' // New field to track the verification status
  }
});

// Create the model
module.exports = mongoose.model('ServiceProvider', ServiceProviderSchema);
