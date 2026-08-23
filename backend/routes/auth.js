const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 1. Real Email Verification OTP Endpoints
router.post('/send-code', authController.sendVerificationCode);
router.post('/verify-code-and-login', authController.verifyCodeAndLogin);

// 2. Traditional Authentication Endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;