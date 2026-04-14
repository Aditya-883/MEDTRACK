const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'patient'],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
