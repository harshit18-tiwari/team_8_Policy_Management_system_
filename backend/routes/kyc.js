const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kycController');
const { verifyToken, checkRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure Multer for KYC document uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fs = require('fs');
        const dir = 'uploads/kyc/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'KYC-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, PNG) and PDF files are allowed'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Policyholder routes
router.post('/upload', verifyToken, upload.single('document'), kycController.uploadKyc);
router.get('/my-documents', verifyToken, kycController.getMyKyc);
router.get('/status', verifyToken, kycController.getKycStatus);

// Admin routes
router.get('/pending', verifyToken, checkRole(['ADMIN', 'UNDERWRITER']), kycController.getPendingKyc);
router.put('/verify/:id', verifyToken, checkRole(['ADMIN', 'UNDERWRITER']), kycController.verifyKyc);

module.exports = router;
