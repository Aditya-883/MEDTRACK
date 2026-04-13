const User = require('../models/User');

// Register or return existing user
exports.createUser = async (req, res) => {
  try {
    let { address, role } = req.body;

    if (!address) return res.status(400).json({ message: "Address required" });

    address = address.toLowerCase();
    if (!role || !['admin', 'doctor', 'patient'].includes(role)) role = "patient";

    const existing = await User.findOne({ address });
    if (existing) return res.status(200).json(existing);

    const user = new User({ address, role });
    await user.save();

    res.status(201).json(user);
  } catch (err) {
    console.error("createUser error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get single user by address
exports.getUser = async (req, res) => {
  try {
    const user = await User.findOne({ address: req.params.address.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update role (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { address } = req.params;

    if (!role || !['admin', 'doctor', 'patient'].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be admin, doctor, or patient." });
    }

    const user = await User.findOneAndUpdate(
      { address: address.toLowerCase() },
      { role },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("updateUserRole error:", err);
    res.status(500).json({ message: "Failed to update role" });
  }
};