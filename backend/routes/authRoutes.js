const express = require('express');
const router = express.Router();
const { verifySignature } = require('../controllers/authController');

// Signature-based login (used by Admin and wallet-based auth)
router.post('/login', verifySignature);

module.exports = router;
