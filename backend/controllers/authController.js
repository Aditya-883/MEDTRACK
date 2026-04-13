const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const User = require('../models/User');

const verifySignature = async (req, res) => {
  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({ message: 'address, signature, and message are required' });
    }

    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    let user = await User.findOne({ address: address.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found in DB' });
    }

    // Admin-only login guard (message "Admin Login" is the admin gate)
    if (message === 'Admin Login' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not an admin' });
    }

    const token = jwt.sign(
      {
        address: user.address,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, role: user.role, address: user.address });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Auth failed' });
  }
};

module.exports = { verifySignature };
