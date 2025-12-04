const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');
const { verifyToken, checkRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/evidence/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post('/file', verifyToken, upload.single('evidence'), claimController.fileClaim);
router.get('/my-claims', verifyToken, claimController.getMyClaims);
router.get('/all', verifyToken, checkRole(['ADMIN', 'ADJUSTER']), claimController.getAllClaims);
router.put('/:id/status', verifyToken, checkRole(['ADMIN', 'ADJUSTER']), claimController.updateClaimStatus);

module.exports = router;
