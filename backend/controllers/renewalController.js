const PolicyModel = require('../models/PolicyModel');
const db = require('../config/db');
const notificationService = require('../services/notificationService');

exports.checkExpiringPolicies = (req, res) => {
    try {
        // Find policies expiring in next 30 days
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringPolicies = db.prepare(`
            SELECT p.*, u.email, u.phone, u.username, pr.name as product_name
            FROM policies p
            JOIN users u ON p.user_id = u.id
            JOIN products pr ON p.product_id = pr.id
            WHERE p.status = 'ACTIVE'
            AND p.end_date <= ?
            AND p.renewal_reminder_sent = 0
        `).all(thirtyDaysFromNow.toISOString().split('T')[0]);

        res.json({
            count: expiringPolicies.length,
            policies: expiringPolicies
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to check expiring policies" });
    }
};

exports.sendRenewalReminders = async (req, res) => {
    try {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringPolicies = db.prepare(`
            SELECT p.*, u.email, u.phone, u.username, pr.name as product_name
            FROM policies p
            JOIN users u ON p.user_id = u.id
            JOIN products pr ON p.product_id = pr.id
            WHERE p.status = 'ACTIVE'
            AND p.end_date <= ?
            AND p.renewal_reminder_sent = 0
        `).all(thirtyDaysFromNow.toISOString().split('T')[0]);

        let sentCount = 0;

        for (const policy of expiringPolicies) {
            const renewalLink = `http://localhost:3000/renew/${policy.id}`;

            // Send email reminder
            await notificationService.sendRenewalReminder(
                policy.email,
                policy.policy_number,
                policy.end_date,
                renewalLink
            );

            // Send SMS reminder
            await notificationService.sendSMS(
                policy.phone,
                `Your policy ${policy.policy_number} expires on ${policy.end_date}. Renew now: ${renewalLink}`
            );

            // Mark as sent
            db.prepare('UPDATE policies SET renewal_reminder_sent = 1 WHERE id = ?').run(policy.id);

            // Log in renewal_reminders table
            db.prepare(`
                INSERT INTO renewal_reminders (policy_id, reminder_date, sent, sent_at, method)
                VALUES (?, ?, 1, CURRENT_TIMESTAMP, 'EMAIL_SMS')
            `).run(policy.id, new Date().toISOString().split('T')[0]);

            sentCount++;
        }

        res.json({
            message: `Renewal reminders sent successfully`,
            count: sentCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send renewal reminders" });
    }
};

exports.renewPolicy = (req, res) => {
    const { policyId } = req.params;

    try {
        const policy = PolicyModel.findById(policyId);
        if (!policy) return res.status(404).json({ error: "Policy not found" });

        if (policy.user_id !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        // Create new policy with extended dates
        const newStartDate = policy.end_date;
        const endDate = new Date(newStartDate);
        endDate.setFullYear(endDate.getFullYear() + 1);

        const newPolicy = PolicyModel.createPolicy(
            policy.user_id,
            policy.product_id,
            policy.premium_amount
        );

        res.json({
            message: "Policy renewal initiated. Please proceed to payment.",
            newPolicyId: newPolicy.lastInsertRowid,
            oldPolicyId: policyId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to renew policy" });
    }
};
