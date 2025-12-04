const ClaimModel = require('../models/ClaimModel');
const AuditModel = require('../models/AuditModel');

/*
  claimController.js
  - Kept behaviour identical to your original file.
  - Improved: consistent error handling, small input validation, clearer transition check.
  - No async/await used because original model methods appear synchronous.
*/

const TRANSITIONS = {
  SUBMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: ['DISBURSED'],
  REJECTED: [], // terminal
  DISBURSED: [], // terminal
};

exports.fileClaim = (req, res) => {
  const { policyId, description, amount } = req.body;
  const userId = req.user && req.user.id;
  const file = req.file; // from multer

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!policyId) {
    return res.status(400).json({ error: 'policyId is required' });
  }

  if (!file) {
    return res.status(400).json({ error: 'Evidence file is required' });
  }

  // optional: validate amount if provided
  if (amount !== undefined && amount !== null) {
    const num = Number(amount);
    if (Number.isNaN(num) || num < 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }
  }

  try {
    // Using file.path as before
    ClaimModel.createClaim(policyId, userId, description, file.path, amount);
    AuditModel.logAction('CLAIM_FILED', userId, `Claim filed for Policy ID ${policyId}`);
    return res.status(201).json({ message: 'Claim submitted successfully' });
  } catch (err) {
    console.error('fileClaim error:', err);
    return res.status(500).json({ error: 'Failed to file claim' });
  }
};

exports.getMyClaims = (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const claims = ClaimModel.findByUserId(userId);
    return res.json(claims);
  } catch (err) {
    console.error('getMyClaims error:', err);
    return res.status(500).json({ error: 'Failed to fetch claims' });
  }
};

exports.getAllClaims = (req, res) => {
  try {
    const claims = ClaimModel.findAll();
    return res.json(claims);
  } catch (err) {
    console.error('getAllClaims error:', err);
    return res.status(500).json({ error: 'Failed to fetch claims' });
  }
};

// State Machine for Claims
exports.updateClaimStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // new status
  const actorId = req.user && req.user.id;

  if (!actorId) return res.status(401).json({ error: 'Unauthorized' });
  if (!id) return res.status(400).json({ error: 'Claim id is required' });
  if (!status) return res.status(400).json({ error: 'New status is required' });

  try {
    const claim = ClaimModel.findById(id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    const current = claim.status;

    // Validate requested status is a known status
    if (!Object.prototype.hasOwnProperty.call(TRANSITIONS, current)) {
      return res.status(400).json({ error: `Unknown current status: ${current}` });
    }

    const allowedNext = TRANSITIONS[current] || [];
    const isValid = allowedNext.includes(status);

    if (!isValid) {
      return res.status(400).json({
        error: `Invalid transition from ${current} to ${status}`
      });
    }

    ClaimModel.updateStatus(id, status);
    AuditModel.logAction('CLAIM_UPDATE', actorId, `Claim ${id} updated to ${status}`);

    return res.json({ message: `Claim status updated to ${status}` });
  } catch (err) {
    console.error('updateClaimStatus error:', err);
    return res.status(500).json({ error: 'Failed to update claim status' });
  }
};

