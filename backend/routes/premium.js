const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumController');
const { verifyToken } = require('../middleware/auth');

router.post('/calculate', verifyToken, premiumController.calculatePremium);

module.exports = router;
