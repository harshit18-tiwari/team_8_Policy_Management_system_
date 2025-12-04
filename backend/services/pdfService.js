const PDFDocument = require('pdfkit');
const fs = require('fs');
const qrCodeService = require('./qrCodeService');

exports.generatePolicyPDF = async (data) => {
    const doc = new PDFDocument({ margin: 50 });

    // Pipe output to file
    doc.pipe(fs.createWriteStream(data.path));

    // Header with company branding
    doc.fontSize(28).fillColor('#2563eb').text('InsureTech', { align: 'center' });
    doc.fontSize(12).fillColor('#666').text('Your Trusted Insurance Partner', { align: 'center' });
    doc.moveDown(0.5);

    // Title
    doc.fontSize(24).fillColor('#000').text('Policy Certificate', { align: 'center', underline: true });
    doc.moveDown(2);

    // Policy Details Box
    doc.fontSize(12).fillColor('#000');
    const leftColumn = 70;
    const rightColumn = 300;
    let yPosition = doc.y;

    // Left column
    doc.text('Policy Number:', leftColumn, yPosition, { continued: true, width: 200 });
    doc.font('Helvetica-Bold').text(data.policyNumber);
    doc.font('Helvetica');

    yPosition += 25;
    doc.text('Policyholder:', leftColumn, yPosition, { continued: true, width: 200 });
    doc.font('Helvetica-Bold').text(data.holderName);
    doc.font('Helvetica');

    yPosition += 25;
    doc.text('Product:', leftColumn, yPosition, { continued: true, width: 200 });
    doc.font('Helvetica-Bold').text(data.productName);
    doc.font('Helvetica');

    yPosition += 25;
    doc.text('Coverage Amount:', leftColumn, yPosition, { continued: true, width: 200 });
    doc.font('Helvetica-Bold').text(`₹${data.coverageAmount ? data.coverageAmount.toLocaleString('en-IN') : 'N/A'}`);
    doc.font('Helvetica');

    // Right column
    yPosition = doc.y - 100;
    doc.text('Premium Paid:', rightColumn, yPosition, { continued: true, width: 200 });
    doc.font('Helvetica-Bold').text(`₹${data.premium.toLocaleString('en-IN')}`);
    doc.font('Helvetica');

    yPosition += 25;
    doc.text('Valid From:', rightColumn, yPosition, { continued: true, width: 200 });
    doc.font('Helvetica-Bold').text(data.startDate);
    doc.font('Helvetica');

    yPosition += 25;
    doc.text('Valid Until:', rightColumn, yPosition, { continued: true, width: 200 });
    doc.font('Helvetica-Bold').text(data.endDate);
    doc.font('Helvetica');

    doc.moveDown(4);

    // Premium Breakdown (if available)
    if (data.premiumBreakdown) {
        doc.fontSize(14).fillColor('#2563eb').text('Premium Breakdown', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#000');

        const breakdown = JSON.parse(data.premiumBreakdown);
        Object.keys(breakdown).forEach(key => {
            doc.text(`${key}: ₹${breakdown[key]}`, { indent: 20 });
        });
        doc.moveDown(1);
    }

    // Features (if available)
    if (data.features) {
        doc.fontSize(14).fillColor('#2563eb').text('Coverage Features', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#000');

        const features = JSON.parse(data.features);
        features.forEach(feature => {
            doc.text(`✓ ${feature}`, { indent: 20 });
        });
        doc.moveDown(1);
    }

    // Generate and add QR Code
    try {
        const qrData = qrCodeService.createPolicyVerificationData(
            data.policyNumber,
            data.userId,
            data.productName
        );
        const qrCodeDataURL = await qrCodeService.generateQRCode(qrData);

        // Add QR code to PDF
        const qrImage = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
        doc.image(qrImage, 450, 650, { width: 100 });
        doc.fontSize(8).fillColor('#666').text('Scan to Verify', 465, 760);
    } catch (err) {
        console.error('QR Code generation failed:', err);
    }

    // Footer
    doc.fontSize(10).fillColor('#666');
    doc.text('This is a computer-generated document and does not require a signature.', 50, 700, {
        align: 'center',
        width: 500
    });

    doc.fontSize(8).fillColor('#999');
    doc.text('For queries, contact: support@insuretech.com | +91-1800-123-4567', 50, 720, {
        align: 'center',
        width: 500
    });

    doc.end();

    return qrData; // Return QR data to store in database
};
