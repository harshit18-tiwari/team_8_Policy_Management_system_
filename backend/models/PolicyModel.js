const db = require('../config/db');

exports.createPolicy = (userId, productId, premiumAmount) => {
    const stmt = db.prepare(`
        INSERT INTO policies (user_id, product_id, premium_amount, status)
        VALUES (?, ?, ?, 'PENDING_PAYMENT')
    `);
    return stmt.run(userId, productId, premiumAmount);
};

exports.findByUserId = (userId) => {
    return db.prepare(`
        SELECT p.*, pr.name as product_name 
        FROM policies p
        JOIN products pr ON p.product_id = pr.id
        WHERE p.user_id = ?
    `).all(userId);
};

exports.findAll = () => {
    return db.prepare(`
        SELECT p.*, u.username, pr.name as product_name
        FROM policies p
        JOIN users u ON p.user_id = u.id
        JOIN products pr ON p.product_id = pr.id
    `).all();
};

exports.findById = (id) => {
    return db.prepare('SELECT * FROM policies WHERE id = ?').get(id);
};

exports.updateStatusAndPdf = (id, status, policyNumber, pdfPath, startDate, endDate) => {
    const stmt = db.prepare(`
        UPDATE policies 
        SET status = ?, policy_number = ?, pdf_path = ?, start_date = ?, end_date = ?
        WHERE id = ?
    `);
    return stmt.run(status, policyNumber, pdfPath, startDate, endDate, id);
};
