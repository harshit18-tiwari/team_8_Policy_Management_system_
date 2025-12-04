const db = require('../config/db');

exports.createClaim = (policyId, userId, description, evidencePath, amount) => {
    const stmt = db.prepare(`
        INSERT INTO claims (policy_id, user_id, description, evidence_path, amount_requested)
        VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(policyId, userId, description, evidencePath, amount);
};

exports.findAll = () => {
    return db.prepare(`
        SELECT c.*, p.policy_number, u.username
        FROM claims c
        JOIN policies p ON c.policy_id = p.id
        JOIN users u ON c.user_id = u.id
    `).all();
};

exports.findByUserId = (userId) => {
    return db.prepare(`
        SELECT c.*, p.policy_number
        FROM claims c
        JOIN policies p ON c.policy_id = p.id
        WHERE c.user_id = ?
    `).all(userId);
};

exports.findById = (id) => {
    return db.prepare('SELECT * FROM claims WHERE id = ?').get(id);
};

exports.updateStatus = (id, status) => {
    const stmt = db.prepare('UPDATE claims SET status = ? WHERE id = ?');
    return stmt.run(status, id);
};
