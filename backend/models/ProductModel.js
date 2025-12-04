const db = require('../config/db');

exports.findAll = () => {
    return db.prepare('SELECT * FROM products').all();
};

exports.findById = (id) => {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
};
