const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

let sequelize;

// Default to SQLite for zero-configuration, rock-solid stability
const dbPath = path.join(__dirname, '..', 'skillforge_ai.db');
sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_FILE || dbPath,
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('📦 Relational SQLite Database connected successfully.');
  } catch (error) {
    console.warn('⚠️ Relational database connection warning (Firestore is primary):', error.message);
  }
};

module.exports = { sequelize, connectDB };