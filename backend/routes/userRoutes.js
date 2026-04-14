const express = require('express');
const router = express.Router();
const { createUser, getUser, getAllUsers, updateUserRole } = require('../controllers/userController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Public: register wallet
router.post('/register', createUser);

// Public: get single user by address (for role checks)
router.get('/:address', getUser);

// Admin only: list all users
router.get('/', verifyToken, requireAdmin, getAllUsers);

// Admin only: update role
router.put('/:address/role', verifyToken, requireAdmin, updateUserRole);

module.exports = router;
