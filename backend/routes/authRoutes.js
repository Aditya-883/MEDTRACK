const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const User = require('../models/User');

// 🔐 ADMIN LOGIN ONLY (signature)
router.post('/login', async (req, res) => {
  try {
    const { address, signature } = req.body;

    const message = "Admin Login";

    const recovered = ethers.verifyMessage(message, signature);

    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const user = await User.findOne({ address: address.toLowerCase() });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Not an admin" });
    }

    const token = jwt.sign(
      { address: user.address, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      role: user.role,
      address: user.address,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 