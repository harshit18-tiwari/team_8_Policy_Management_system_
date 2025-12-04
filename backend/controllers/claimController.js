const ClaimModel = require('../models/ClaimModel');
const AuditModel = require('../models/AuditModel');

exports.fileClaim = (req, res) => {
    const { policyId, description, amount } = req.body;
    const userId = req.user.id;
    const file = req.file; // From multer

    if (!file) return res.status(400).json({ error: "Evidence file is required" });

    try {
        ClaimModel.createClaim(policyId, userId, description, file.path, amount);
        AuditModel.logAction('CLAIM_FILED', userId, `Claim filed for Policy ID ${policyId}`);
        res.status(201).json({ message: "Claim submitted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to file claim" });
    }
};

exports.getMyClaims = (req, res) => {
    const claims = ClaimModel.findByUserId(req.user.id);
    res.json(claims);
};

exports.getAllClaims = (req, res) => {
    const claims = ClaimModel.findAll();
    res.json(claims);
};

// State Machine for Claims
exports.updateClaimStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // New status

    // Allowed transitions
    // SUBMITTED -> UNDER_REVIEW
    // UNDER_REVIEW -> APPROVED or REJECTED
    // APPROVED -> DISBURSED

    const claim = ClaimModel.findById(id);
    if (!claim) return res.status(404).json({ error: "Claim not found" });

    const current = claim.status;
    let valid = false;

    if (current === 'SUBMITTED' && status === 'UNDER_REVIEW') valid = true;
    else if (current === 'UNDER_REVIEW' && (status === 'APPROVED' || status === 'REJECTED')) valid = true;
    else if (current === 'APPROVED' && status === 'DISBURSED') valid = true;

    if (!valid) {
        return res.status(400).json({
            error: `Invalid transition from ${current} to ${status}`
        });
    }

    ClaimModel.updateStatus(id, status);
    AuditModel.logAction('CLAIM_UPDATE', req.user.id, `Claim ${id} updated to ${status}`);

    res.json({ message: `Claim status updated to ${status}` });
};
