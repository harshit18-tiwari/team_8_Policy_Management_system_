// Wrapper for better-sqlite3 to be used in models
const Database = require('better-sqlite3');
const path = require('path');

// Open the DB file created by dbInit.js
const db = new Database(path.join(__dirname, '../policy_system.db'));

module.exports = db;
