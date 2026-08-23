/**
 * Firebase Database Sync Service
 * Connects frontend state with backend Firestore database endpoints
 */

const API_BASE = 'http://localhost:5001/api/db';

export const firebaseSync = {
  // Check Database Status
  async getStatus() {
    try {
      const res = await fetch(`${API_BASE}/status`);
      return await res.json();
    } catch (err) {
      console.warn('Firebase status check failed:', err.message);
      return { status: 'offline' };
    }
  },

  // Fetch User Profile from Firestore
  async fetchUserProfile(userId, token) {
    try {
      const res = await fetch(`${API_BASE}/profile/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (err) {
      console.warn('Failed to fetch user profile from Firestore:', err.message);
      return null;
    }
  },

  // Save User Profile to Firestore
  async saveUserProfile(profileData, token) {
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(profileData),
      });
      return await res.json();
    } catch (err) {
      console.warn('Failed to save profile to Firestore:', err.message);
      return null;
    }
  },

  // Fetch Skills from Firestore
  async fetchUserSkills(userId) {
    try {
      const res = await fetch(`${API_BASE}/skills/${userId}`);
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (err) {
      console.warn('Failed to fetch skills from Firestore:', err.message);
      return null;
    }
  },

  // Save/Update Skill Scores in Firestore
  async saveUserSkills(userId, skillScores, domainId, token) {
    try {
      const res = await fetch(`${API_BASE}/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ userId, skillScores, domainId }),
      });
      return await res.json();
    } catch (err) {
      console.warn('Failed to save skills to Firestore:', err.message);
      return null;
    }
  },

  // Save Project Submission in Firestore
  async saveProjectSubmission(projectData, token) {
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(projectData),
      });
      return await res.json();
    } catch (err) {
      console.warn('Failed to record project in Firestore:', err.message);
      return null;
    }
  },

  // Save AI Mock Interview in Firestore
  async saveInterviewRecord(interviewData, token) {
    try {
      const res = await fetch(`${API_BASE}/interviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(interviewData),
      });
      return await res.json();
    } catch (err) {
      console.warn('Failed to save interview in Firestore:', err.message);
      return null;
    }
  },
};

export default firebaseSync;
