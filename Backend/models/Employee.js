const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const Schema = mongoose.Schema;

const EmployeeSchema = new Schema({
    name: { type: String, required: true },
    Lname: { type: String, required: false },
    Phonenumber: { type: Number, required: false },
    email: {
        type: String,
        required: true,
        unique: true, 
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'], 
    },

    password: {type: String,required: true,minlength: 6, },

    role: {
        type: String,
        enum: ['Admin', 'Staff', 'Customer_Care'],
        required: true,
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    createdAt: {type: Date,default: Date.now,},
});

// Create a method to compare passwords during login
EmployeeSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password); // Compare provided password with hashed password
    } catch (err) {
        throw new Error('Password comparison failed');
    }
};

// Create the model
module.exports = mongoose.model('Employee', EmployeeSchema);
