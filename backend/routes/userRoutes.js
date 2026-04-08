const express = require('express');
const router = express.Router();

const {
  createUser,
  getUser,
  getAllUsers,
  updateUserRole,
} = require('../controllers/userController');

const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// ✅ NEW ROUTE (FIXES YOUR BUG)
router.post('/register', createUser);

// ✅ EXISTING ROUTES (UNCHANGED)
router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/:address', getUser);
router.put('/:address', updateUserRole);
router.put('/:address/role', verifyToken, requireAdmin, updateUserRole);

module.exports = router;