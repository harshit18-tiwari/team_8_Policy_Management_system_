const KycModel = require('../models/KycModel');
const AuditModel = require('../models/AuditModel');

exports.uploadKyc = (req, res) => {
    const { documentType, documentNumber } = req.body;
    const userId = req.user.id;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "Document file is required" });

    const validTypes = ['AADHAR', 'PAN', 'LICENSE', 'PASSPORT'];
    if (!validTypes.includes(documentType)) {
        return res.status(400).json({ error: "Invalid document type" });
    }

    try {
        KycModel.createKyc(userId, documentType, documentNumber, file.path);
        AuditModel.logAction('KYC_UPLOADED', userId, `${documentType} document uploaded`);

        res.status(201).json({
            message: "KYC document uploaded successfully. Awaiting verification.",
            documentType
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to upload KYC document" });
    }
};

exports.getMyKyc = (req, res) => {
    const documents = KycModel.findByUserId(req.user.id);
    res.json(documents);
};

exports.getKycStatus = (req, res) => {
    const isVerified = KycModel.isUserVerified(req.user.id);
    const documents = KycModel.findByUserId(req.user.id);

    res.json({
        verified: isVerified,
        documents: documents
    });
};

exports.getPendingKyc = (req, res) => {
    const pending = KycModel.findPending();
    res.json(pending);
};

exports.verifyKyc = (req, res) => {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    if (status === 'REJECTED' && !rejectionReason) {
        return res.status(400).json({ error: "Rejection reason is required" });
    }

    try {
        const kyc = KycModel.findById(id);
        if (!kyc) return res.status(404).json({ error: "KYC document not found" });

        KycModel.updateStatus(id, status, req.user.id, rejectionReason);
        AuditModel.logAction('KYC_VERIFIED', req.user.id, `KYC ${id} ${status} by ${req.user.username}`);

        res.json({ message: `KYC document ${status.toLowerCase()}`, status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to verify KYC" });
    }
};
