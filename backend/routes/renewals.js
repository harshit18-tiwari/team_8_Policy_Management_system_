const express = require('express');
const router = express.Router();
const renewalController = require('../controllers/renewalController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Check expiring policies
router.get('/check', verifyToken, checkRole(['ADMIN', 'UNDERWRITER']), renewalController.checkExpiringPolicies);

// Send renewal reminders (Admin action)
router.post('/send-reminders', verifyToken, checkRole(['ADMIN']), renewalController.sendRenewalReminders);

// Renew a policy (Policyholder action)
router.post('/renew/:policyId', verifyToken, renewalController.renewPolicy);

module.exports = router;
