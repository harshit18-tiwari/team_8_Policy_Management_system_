const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

exports.generateQRCode = async (data) => {
    try {
        // Generate QR code as data URL
        const qrDataURL = await QRCode.toDataURL(data, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 200,
            margin: 1
        });

        return qrDataURL;
    } catch (err) {
        console.error('QR Code generation error:', err);
        throw err;
    }
};

exports.generateQRCodeFile = async (data, filename) => {
    try {
        const qrDir = path.join(__dirname, '../uploads/qrcodes');
        if (!fs.existsSync(qrDir)) {
            fs.mkdirSync(qrDir, { recursive: true });
        }

        const filepath = path.join(qrDir, filename);
        await QRCode.toFile(filepath, data, {
            errorCorrectionLevel: 'H',
            width: 300
        });

        return filepath;
    } catch (err) {
        console.error('QR Code file generation error:', err);
        throw err;
    }
};

exports.createPolicyVerificationData = (policyNumber, userId, productName) => {
    return JSON.stringify({
        policyNumber,
        userId,
        productName,
        verificationURL: `https://insuretech.com/verify/${policyNumber}`,
        timestamp: new Date().toISOString()
    });
};
