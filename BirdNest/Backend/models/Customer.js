const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing

// Correct capitalization of Schema
const Schema = mongoose.Schema;

// Define the schema with email and password
const CustomerSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    
    Lname: {
        type: String,
        required: false,
    },
    
    Gender: {
        type: String,
        required: false,
    },
   
    Phonenumber: {
        type: Number,
        required: false,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensure that email is unique
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'], // Basic email validation
    },
    Address: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: true,
        minlength: 6, // Minimum password length
    },
    profileImage: { 
        type: String,
    },
});

// Create a method to compare passwords during login
CustomerSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password); // Compare provided password with hashed password
    } catch (err) {
        throw new Error('Password comparison failed');
    }
};

// Create the model
const Customer = mongoose.model('Customer', CustomerSchema);

module.exports = Customer;
