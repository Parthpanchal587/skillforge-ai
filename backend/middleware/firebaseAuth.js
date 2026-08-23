const { auth, isFirebaseConnected } = require('../config/firebase');
const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];

    // If live Firebase Admin is connected, verify with Firebase
    if (isFirebaseConnected && auth) {
      try {
        const decodedFirebaseToken = await auth.verifyIdToken(token);
        req.user = {
          id: decodedFirebaseToken.uid,
          uid: decodedFirebaseToken.uid,
          email: decodedFirebaseToken.email,
          role: decodedFirebaseToken.role || 'student',
        };
        return next();
      } catch (fbErr) {
        // If it's not a Firebase ID Token, try verifying as JWT fallback
      }
    }

    // Fallback: verify standard JWT
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hackathon_secret_key_change_in_production');
      req.user = decoded;
      return next();
    } catch (jwtErr) {
      return res.status(401).json({ message: 'Invalid or expired authentication token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Authentication failed' });
  }
};

module.exports = verifyToken;
