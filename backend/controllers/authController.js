const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');
const { validateEmailDomain, sendVerificationEmail } = require('../services/emailService');

// Secure in-memory & Firestore temporary OTP store with expiry
const otpStore = new Map();

// Helper to generate 6-digit numeric OTP code
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 1. Send Email Verification Code (OTP)
 * Generates OTP and sends strictly to the user's email inbox (NEVER exposed in API response)
 */
exports.sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Verify that email domain actually exists and has Mail Exchange (MX) servers
    const validation = await validateEmailDomain(cleanEmail);
    if (!validation.valid) {
      return res.status(400).json({
        message: validation.reason || 'Invalid or non-existent email domain. Please enter a real email address.',
      });
    }

    // 2. Generate secure 6-digit code
    const code = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store securely in memory & Firestore
    otpStore.set(cleanEmail, { code, expiresAt });
    try {
      await db.collection('otp_codes').doc(cleanEmail).set({ code, expiresAt, updatedAt: new Date().toISOString() });
    } catch (e) {}

    // 3. Dispatch email strictly to recipient's mailbox
    await sendVerificationEmail(cleanEmail, code);

    // 4. Return success response WITHOUT exposing the secret OTP
    res.json({
      success: true,
      message: `A 6-digit verification passcode has been sent to ${cleanEmail}. Please check your email inbox (and spam folder).`,
      email: cleanEmail,
      expiresInMinutes: 10,
    });
  } catch (error) {
    console.error('Send verification code error:', error);
    res.status(500).json({ message: 'Failed to send verification code to email', error: error.message });
  }
};

/**
 * 2. Verify Code & Complete Login / Instant Signup
 */
exports.verifyCodeAndLogin = async (req, res) => {
  try {
    const { email, code, username } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and 6-digit verification code are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // Retrieve stored OTP
    let stored = otpStore.get(cleanEmail);
    if (!stored) {
      try {
        const doc = await db.collection('otp_codes').doc(cleanEmail).get();
        if (doc.exists) stored = doc.data();
      } catch (e) {}
    }

    if (!stored || stored.code !== cleanCode) {
      return res.status(400).json({ message: 'Invalid verification code. Please check your email and enter the exact code.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
    }

    // Code is valid! Consume it
    otpStore.delete(cleanEmail);
    try {
      await db.collection('otp_codes').doc(cleanEmail).delete();
    } catch (e) {}

    // Check if user already exists in Firestore
    let userDoc = null;
    const snapshot = await db.collection('users').where('email', '==', cleanEmail).get();

    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        userDoc = { id: doc.id, ...doc.data() };
      });
    } else {
      // Create new user automatically upon real email verification
      const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      userDoc = {
        id: userId,
        username: username || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'student',
        emailVerified: true,
        xp: 100,
        streak: 1,
        currentLevel: 'Apprentice',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.collection('users').doc(userId).set(userDoc);
    }

    // Generate session JWT
    const token = jwt.sign(
      { id: userDoc.id, email: userDoc.email, role: userDoc.role, username: userDoc.username },
      process.env.JWT_SECRET || 'hackathon_secret_key_change_in_production',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Email verified successfully! Welcome to SkillForge AI.',
      token,
      user: {
        id: userDoc.id,
        username: userDoc.username,
        email: userDoc.email,
        role: userDoc.role,
        xp: userDoc.xp || 100,
        streak: userDoc.streak || 1,
      },
    });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

/**
 * 3. Traditional Email/Password Registration
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const validation = await validateEmailDomain(cleanEmail);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.reason });
    }

    const existingUsers = await db.collection('users').where('email', '==', cleanEmail).get();
    if (!existingUsers.empty) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const newUser = {
      id: userId,
      username: username || cleanEmail.split('@')[0],
      email: cleanEmail,
      password: hashedPassword,
      role: role || 'student',
      xp: 100,
      streak: 1,
      currentLevel: 'Apprentice',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('users').doc(userId).set(newUser);

    const token = jwt.sign(
      { id: userId, email: newUser.email, role: newUser.role, username: newUser.username },
      process.env.JWT_SECRET || 'hackathon_secret_key_change_in_production',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: {
        id: userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

/**
 * 4. Traditional Login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const snapshot = await db.collection('users').where('email', '==', cleanEmail).get();
    if (snapshot.empty) {
      return res.status(400).json({ message: 'No account found with this email. Please register or verify with code.' });
    }

    let userDoc = null;
    snapshot.forEach((doc) => {
      userDoc = { id: doc.id, ...doc.data() };
    });

    if (userDoc.password) {
      const isMatch = await bcrypt.compare(password, userDoc.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
    }

    const token = jwt.sign(
      { id: userDoc.id, email: userDoc.email, role: userDoc.role, username: userDoc.username },
      process.env.JWT_SECRET || 'hackathon_secret_key_change_in_production',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: userDoc.id,
        username: userDoc.username,
        email: userDoc.email,
        role: userDoc.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};