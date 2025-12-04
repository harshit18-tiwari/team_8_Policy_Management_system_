const db = require('../config/db');

exports.createUser = (username, password, role) => {
    const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
    return stmt.run(username, password, role);
};

exports.findByUsername = (username) => {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
};

exports.findById = (id) => {
    const stmt = db.prepare('SELECT id, username, role FROM users WHERE id = ?');
    return stmt.get(id);
};
