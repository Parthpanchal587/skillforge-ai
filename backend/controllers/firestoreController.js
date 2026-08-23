const { db } = require('../config/firebase');

/**
 * Firestore Database Controller
 * Manages collections: users, skills, projects, interviews, and courses
 */

// 1. Get or Create User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const doc = await db.collection('users').doc(userId).get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'User profile not found in database' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Database error fetching profile', error: error.message });
  }
};

// 2. Save or Update User Profile
exports.saveUserProfile = async (req, res) => {
  try {
    const { userId, name, username, email, education, year, selectedDomain, xp, streak, currentLevel } = req.body;
    const targetId = userId || req.user?.id;

    if (!targetId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const payload = {
      ...(name && { name }),
      ...(username && { username }),
      ...(email && { email }),
      ...(education && { education }),
      ...(year && { year }),
      ...(selectedDomain && { selectedDomain }),
      ...(xp !== undefined && { xp }),
      ...(streak !== undefined && { streak }),
      ...(currentLevel && { currentLevel }),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('users').doc(targetId).set(payload, { merge: true });

    res.json({ message: 'User profile updated successfully', userId: targetId, data: payload });
  } catch (error) {
    console.error('Error saving user profile:', error);
    res.status(500).json({ message: 'Database error saving profile', error: error.message });
  }
};

// 3. Get User Skill Scores
exports.getUserSkills = async (req, res) => {
  try {
    const { userId } = req.params;
    const doc = await db.collection('skills').doc(userId).get();

    if (!doc.exists) {
      return res.json({ userId, skillScores: {} });
    }

    res.json({ userId, ...doc.data() });
  } catch (error) {
    console.error('Error fetching user skills:', error);
    res.status(500).json({ message: 'Database error fetching skills', error: error.message });
  }
};

// 4. Save/Update Skill Scores
exports.saveUserSkills = async (req, res) => {
  try {
    const { userId, skillScores, domainId } = req.body;
    const targetId = userId || req.user?.id;

    if (!targetId || !skillScores) {
      return res.status(400).json({ message: 'userId and skillScores are required' });
    }

    const payload = {
      skillScores,
      ...(domainId && { domainId }),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('skills').doc(targetId).set(payload, { merge: true });

    res.json({ message: 'Skill scores saved in Firestore', userId: targetId, skillScores });
  } catch (error) {
    console.error('Error saving user skills:', error);
    res.status(500).json({ message: 'Database error saving skills', error: error.message });
  }
};

// 5. Save Project Submission
exports.saveProjectSubmission = async (req, res) => {
  try {
    const { userId, projectId, code, feedback, score, domain } = req.body;
    const targetId = userId || req.user?.id;

    const projectRef = await db.collection('projects').add({
      userId: targetId,
      projectId,
      code: code || '',
      feedback: feedback || '',
      score: score || 0,
      domain: domain || 'fullstack',
      submittedAt: new Date().toISOString(),
    });

    res.json({ message: 'Project submission recorded', submissionId: projectRef.id });
  } catch (error) {
    console.error('Error saving project submission:', error);
    res.status(500).json({ message: 'Database error saving project', error: error.message });
  }
};

// 6. Save Interview Record
exports.saveInterviewRecord = async (req, res) => {
  try {
    const { userId, role, overallScore, transcript, feedback } = req.body;
    const targetId = userId || req.user?.id;

    const interviewRef = await db.collection('interviews').add({
      userId: targetId,
      role: role || 'frontend-dev',
      overallScore: overallScore || 0,
      transcript: transcript || [],
      feedback: feedback || {},
      completedAt: new Date().toISOString(),
    });

    res.json({ message: 'Interview session saved', interviewId: interviewRef.id });
  } catch (error) {
    console.error('Error saving interview record:', error);
    res.status(500).json({ message: 'Database error saving interview', error: error.message });
  }
};

// 7. Health / Database Status
exports.getDatabaseStatus = async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      database: 'Cloud Firestore (Firebase)',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
