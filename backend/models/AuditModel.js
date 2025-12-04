const db = require('../config/db');

exports.logAction = (action, userId, details) => {
    const stmt = db.prepare('INSERT INTO audit_logs (action, user_id, details) VALUES (?, ?, ?)');
    stmt.run(action, userId, details);
};
