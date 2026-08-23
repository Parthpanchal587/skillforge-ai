const express = require('express');
const router = express.Router();
const firestoreController = require('../controllers/firestoreController');
const verifyToken = require('../middleware/firebaseAuth');

// Public status check
router.get('/status', firestoreController.getDatabaseStatus);

// User Profile
router.get('/profile/:userId', firestoreController.getUserProfile);
router.post('/profile', verifyToken, firestoreController.saveUserProfile);

// Skill Matrix
router.get('/skills/:userId', firestoreController.getUserSkills);
router.post('/skills', verifyToken, firestoreController.saveUserSkills);

// Projects & Submissions
router.post('/projects', verifyToken, firestoreController.saveProjectSubmission);

// Interview Interrogations
router.post('/interviews', verifyToken, firestoreController.saveInterviewRecord);

module.exports = router;
