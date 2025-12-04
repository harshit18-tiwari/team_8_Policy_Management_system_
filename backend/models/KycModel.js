const db = require('../config/db');

exports.createKyc = (userId, documentType, documentNumber, filePath) => {
    const stmt = db.prepare(`
        INSERT INTO kyc_documents (user_id, document_type, document_number, file_path, status)
        VALUES (?, ?, ?, ?, 'PENDING')
    `);
    return stmt.run(userId, documentType, documentNumber, filePath);
};

exports.findByUserId = (userId) => {
    return db.prepare(`
        SELECT * FROM kyc_documents 
        WHERE user_id = ?
        ORDER BY created_at DESC
    `).all(userId);
};

exports.findById = (id) => {
    return db.prepare('SELECT * FROM kyc_documents WHERE id = ?').get(id);
};

exports.findPending = () => {
    return db.prepare(`
        SELECT k.*, u.username, u.email
        FROM kyc_documents k
        JOIN users u ON k.user_id = u.id
        WHERE k.status = 'PENDING'
        ORDER BY k.created_at ASC
    `).all();
};

exports.updateStatus = (id, status, verifiedBy, rejectionReason = null) => {
    const stmt = db.prepare(`
        UPDATE kyc_documents 
        SET status = ?, verified_by = ?, verified_at = CURRENT_TIMESTAMP, rejection_reason = ?
        WHERE id = ?
    `);
    return stmt.run(status, verifiedBy, rejectionReason, id);
};

exports.isUserVerified = (userId) => {
    const result = db.prepare(`
        SELECT COUNT(*) as count FROM kyc_documents 
        WHERE user_id = ? AND status = 'VERIFIED'
    `).get(userId);
    return result.count > 0;
};
