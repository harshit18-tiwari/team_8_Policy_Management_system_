const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Create a policy (Purchase)
router.post('/purchase', verifyToken, policyController.purchasePolicy);

// List my policies
router.get('/my-policies', verifyToken, policyController.getMyPolicies);

// Admin: List all policies
router.get('/all', verifyToken, checkRole(['ADMIN', 'UNDERWRITER']), policyController.getAllPolicies);

module.exports = router;
