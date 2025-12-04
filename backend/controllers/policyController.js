const PolicyModel = require('../models/PolicyModel');
const ProductModel = require('../models/ProductModel');
const AuditModel = require('../models/AuditModel');
const pdfService = require('../services/pdfService');

// 1. User initiates purchase
exports.purchasePolicy = (req, res) => {
    const { productId, premiumAmount, coverageAmount, premiumBreakdown } = req.body;
    const userId = req.user.id;

    try {
        // Create record with 'PENDING_PAYMENT'
        const db = require('../config/db');
        const result = db.prepare(`
            INSERT INTO policies (user_id, product_id, premium_amount, coverage_amount, premium_breakdown, status)
            VALUES (?, ?, ?, ?, ?, 'PENDING_PAYMENT')
        `).run(userId, productId, premiumAmount, coverageAmount, JSON.stringify(premiumBreakdown));

        AuditModel.logAction('PURCHASE_INITIATED', userId, `Policy ID ${result.lastInsertRowid} created pending payment`);

        res.status(201).json({
            message: "Policy created. Please proceed to payment.",
            policyId: result.lastInsertRowid
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Purchase failed" });
    }
};

// 2. Simulate Payment & Issue Policy
exports.simulatePayment = async (req, res) => {
    const { policyId } = req.body;

    try {
        const policy = PolicyModel.findById(policyId);
        if (!policy) return res.status(404).json({ error: "Policy not found" });

        if (policy.status === 'ACTIVE') {
            return res.status(400).json({ error: "Policy is already active" });
        }

        // Generate Policy Number
        const policyNumber = `POL-${Date.now()}-${policyId}`;
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

        // Generate PDF
        const pdfFileName = `${policyNumber}.pdf`;
        const pdfPath = `uploads/policies/${pdfFileName}`;

        // Get Product details for PDF
        const product = ProductModel.findById(policy.product_id);

        // Generate PDF with QR code
        const qrData = await pdfService.generatePolicyPDF({
            path: pdfPath,
            policyNumber,
            productName: product.name,
            premium: policy.premium_amount,
            coverageAmount: policy.coverage_amount,
            holderName: req.user.username,
            userId: req.user.id,
            startDate,
            endDate,
            premiumBreakdown: policy.premium_breakdown,
            features: product.features
        });

        // Update DB with QR code
        const db = require('../config/db');
        db.prepare(`
            UPDATE policies 
            SET status = ?, policy_number = ?, pdf_path = ?, start_date = ?, end_date = ?, qr_code = ?
            WHERE id = ?
        `).run('ACTIVE', policyNumber, pdfPath, startDate, endDate, qrData, policyId);

        AuditModel.logAction('PAYMENT_SUCCESS', req.user.id, `Policy ${policyNumber} issued`);

        res.json({ message: "Payment successful! Policy issued.", policyNumber, pdfUrl: `/${pdfPath}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Payment simulation failed" });
    }
};

exports.getMyPolicies = (req, res) => {
    const policies = PolicyModel.findByUserId(req.user.id);
    res.json(policies);
};

exports.getAllPolicies = (req, res) => {
    const policies = PolicyModel.findAll();
    res.json(policies);
};
