// Simple notification service using nodemailer.
// Fixes the "createTransporter is not a function" error by using nodemailer.createTransport.
// Falls back to an Ethereal test account if SMTP env vars are not provided (good for local dev).

const nodemailer = require('nodemailer');

let transporterPromise = null;

// Create transporter. If SMTP credentials provided via env, use them.
// Otherwise create an Ethereal test account for local development.
async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      // Use the provided SMTP settings
      return nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort) || 587,
        secure: false, // set to true for port 465 with TLS
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }

    // No SMTP creds: create a free Ethereal account for testing
    console.log('No SMTP credentials found — creating Ethereal test account for email dev.');
    const testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  })();

  return transporterPromise;
}

// sendMail helper: accepts an options object { to, subject, text, html }
async function sendMail({ to, subject, text, html }) {
  const transporter = await getTransporter();

  const from = process.env.EMAIL_FROM || '"PolicyMS" <no-reply@policymgmt.local>';

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  // If using Ethereal, print preview URL to console (very useful in dev)
  if (nodemailer.getTestMessageUrl && info) {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('Preview URL: %s', preview);
  }

  console.log(`Email sent to ${to}: messageId=${info.messageId}`);
  return info;
}

module.exports = {
  sendMail,
};
