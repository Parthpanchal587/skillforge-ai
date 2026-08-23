const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let db = null;
let auth = null;
let isFirebaseConnected = false;

// 1. Try loading from serviceAccountKey.json file
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
const persistentDbPath = path.join(__dirname, '..', 'data', 'firestore_db.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    if (serviceAccount.project_id && serviceAccount.private_key) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}.firebaseio.com`
      });
      db = admin.firestore();
      auth = admin.auth();
      isFirebaseConnected = true;
      console.log('🔥 Firebase Admin connected using serviceAccountKey.json');
    }
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    });
    db = admin.firestore();
    auth = admin.auth();
    isFirebaseConnected = true;
    console.log(`🔥 Firebase Admin connected for project: ${process.env.FIREBASE_PROJECT_ID}`);
  }
} catch (err) {
  console.log('Falling back to local Firestore persistence engine:', err.message);
}

// 2. Local Persistent File-Backed Firestore Engine
if (!isFirebaseConnected || !db) {
  console.log('📦 Initializing Local Persistent Cloud Firestore Engine...');

  // Helper to load/save JSON file
  const loadDb = () => {
    try {
      if (fs.existsSync(persistentDbPath)) {
        return JSON.parse(fs.readFileSync(persistentDbPath, 'utf8'));
      }
    } catch (e) {
      console.error('Error reading persistent db, creating new:', e.message);
    }
    return {
      users: {
        'demo_user': {
          id: 'demo_user',
          username: 'Prem (Demo Pro)',
          email: 'prem@skillforge.ai',
          role: 'student',
          xp: 1450,
          streak: 5,
          currentLevel: 'Full Stack Specialist',
          education: 'B.Tech Computer Science',
          year: '2026',
          selectedDomain: 'fullstack',
          createdAt: new Date().toISOString(),
        }
      },
      skills: {
        'demo_user': {
          userId: 'demo_user',
          domainId: 'fullstack',
          skillScores: {
            'html-css': { score: 92, status: 'MASTERED' },
            'javascript': { score: 88, status: 'MASTERED' },
            'react': { score: 84, status: 'STRONG' },
            'nodejs': { score: 75, status: 'DEVELOPING' },
            'rest-api': { score: 45, status: 'NEEDS_IMPROVEMENT' },
            'databases': { score: 60, status: 'DEVELOPING' },
            'git': { score: 90, status: 'MASTERED' }
          },
          updatedAt: new Date().toISOString()
        }
      },
      projects: {},
      interviews: {},
      courses: {}
    };
  };

  const saveDb = (data) => {
    try {
      fs.writeFileSync(persistentDbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error writing persistent db:', e.message);
    }
  };

  // Create initial persistent store if not present
  if (!fs.existsSync(persistentDbPath)) {
    saveDb(loadDb());
  }

  const createDocRef = (colName, docId) => ({
    id: docId,
    get: async () => {
      const data = loadDb();
      const col = data[colName] || {};
      const docData = col[docId];
      return {
        id: docId,
        exists: !!docData,
        data: () => docData || null,
      };
    },
    set: async (docData, options = {}) => {
      const data = loadDb();
      if (!data[colName]) data[colName] = {};
      
      if (options.merge) {
        data[colName][docId] = { ...(data[colName][docId] || {}), ...docData, updatedAt: new Date().toISOString() };
      } else {
        data[colName][docId] = { ...docData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      }
      saveDb(data);
      return { writeTime: new Date() };
    },
    update: async (docData) => {
      const data = loadDb();
      if (!data[colName]) data[colName] = {};
      data[colName][docId] = { ...(data[colName][docId] || {}), ...docData, updatedAt: new Date().toISOString() };
      saveDb(data);
      return { writeTime: new Date() };
    },
    delete: async () => {
      const data = loadDb();
      if (data[colName] && data[colName][docId]) {
        delete data[colName][docId];
        saveDb(data);
      }
      return { writeTime: new Date() };
    }
  });

  db = {
    collection: (colName) => ({
      doc: (docId) => createDocRef(colName, docId || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`),
      add: async (docData) => {
        const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const docRef = createDocRef(colName, docId);
        await docRef.set(docData);
        return docRef;
      },
      where: (field, op, val) => ({
        get: async () => {
          const data = loadDb();
          const col = data[colName] || {};
          const matches = [];

          Object.entries(col).forEach(([id, item]) => {
            let isMatch = false;
            if (op === '==' && item[field] === val) isMatch = true;
            if (op === '>=' && item[field] >= val) isMatch = true;
            if (op === '<=' && item[field] <= val) isMatch = true;

            if (isMatch) {
              matches.push({
                id,
                exists: true,
                data: () => item,
              });
            }
          });

          return {
            empty: matches.length === 0,
            size: matches.length,
            docs: matches,
            forEach: (cb) => matches.forEach(cb),
          };
        }
      }),
      get: async () => {
        const data = loadDb();
        const col = data[colName] || {};
        const matches = Object.entries(col).map(([id, item]) => ({
          id,
          exists: true,
          data: () => item,
        }));

        return {
          empty: matches.length === 0,
          size: matches.length,
          docs: matches,
          forEach: (cb) => matches.forEach(cb),
        };
      }
    })
  };

  auth = {
    verifyIdToken: async (token) => {
      return { uid: 'uid_' + token.slice(-8), email: 'player@skillforge.ai' };
    },
    createUser: async (userData) => {
      const uid = 'usr_' + Date.now();
      await db.collection('users').doc(uid).set({ id: uid, ...userData });
      return { uid, ...userData };
    }
  };

  console.log('✅ Persistent Firestore database ready at backend/data/firestore_db.json');
}

module.exports = {
  admin,
  db,
  auth,
  isFirebaseConnected,
};
