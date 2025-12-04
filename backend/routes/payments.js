const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');
const { verifyToken } = require('../middleware/auth');

// Simulates a payment gateway callback
router.post('/simulate', verifyToken, policyController.simulatePayment);

module.exports = router;
