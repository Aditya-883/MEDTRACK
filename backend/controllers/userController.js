const User = require('../models/User');
const { ethers } = require('ethers');

// ✅ CREATE USER (FIXED + SAFE)
exports.createUser = async (req, res) => {
  try {
    let { address, role } = req.body;

    if (!address) {
      return res.status(400).json({ message: "Address required" });
    }

    // ✅ NORMALIZE ADDRESS
    address = address.toLowerCase();

    // ✅ DEFAULT ROLE
    if (!role) role = "patient";

    const existing = await User.findOne({ address });

    if (existing) {
      return res.status(200).json(existing);
    }

    const user = new User({
      address,
      role,
    });

    await user.save();

    res.status(201).json(user);

  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET USER
exports.getUser = async (req, res) => {
  try {
    const user = await User.findOne({
      address: req.params.address.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔐 VERIFY SIGNATURE (NOT USED YET BUT KEPT SAFE)
const verifySignature = (address, signature, message) => {
  const recoveredAddress = ethers.verifyMessage(message, signature);
  return recoveredAddress.toLowerCase() === address.toLowerCase();
};

// ✅ UPDATE ROLE
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { address } = req.params;

    const user = await User.findOneAndUpdate(
      { address: address.toLowerCase() },
      { role },
      { new: true }
    );

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: 'Failed to update role' });
  }
};