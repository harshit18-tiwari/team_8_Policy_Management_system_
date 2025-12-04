const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Create or open the database file
const db = new Database('policy_system.db');

console.log('Initializing Database...');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// 1. Users Table
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'POLICYHOLDER',
        email TEXT,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// 2. Products Table (Enhanced)
db.exec(`
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        base_price REAL NOT NULL,
        description TEXT,
        coverage_min REAL,
        coverage_max REAL,
        features TEXT,
        terms TEXT
    )
`);

// 3. Policies Table (Enhanced)
db.exec(`
    CREATE TABLE IF NOT EXISTS policies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        policy_number TEXT UNIQUE,
        status TEXT DEFAULT 'PENDING_PAYMENT',
        start_date TEXT,
        end_date TEXT,
        premium_amount REAL,
        coverage_amount REAL,
        pdf_path TEXT,
        qr_code TEXT,
        premium_breakdown TEXT,
        renewal_reminder_sent INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    )
`);

// 4. Claims Table
db.exec(`
    CREATE TABLE IF NOT EXISTS claims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        policy_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        status TEXT DEFAULT 'SUBMITTED',
        description TEXT,
        evidence_path TEXT,
        amount_requested REAL,
        amount_approved REAL,
        rejection_reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (policy_id) REFERENCES policies(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`);

// 5. KYC Documents Table (NEW)
db.exec(`
    CREATE TABLE IF NOT EXISTS kyc_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        document_type TEXT NOT NULL,
        document_number TEXT,
        file_path TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        verified_by INTEGER,
        verified_at DATETIME,
        rejection_reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (verified_by) REFERENCES users(id)
    )
`);

// 6. Renewal Reminders Table (NEW)
db.exec(`
    CREATE TABLE IF NOT EXISTS renewal_reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        policy_id INTEGER NOT NULL,
        reminder_date DATE NOT NULL,
        sent INTEGER DEFAULT 0,
        sent_at DATETIME,
        method TEXT,
        FOREIGN KEY (policy_id) REFERENCES policies(id)
    )
`);

// 7. Audit Log Table (Enhanced)
db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        user_id INTEGER,
        entity_type TEXT,
        entity_id INTEGER,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// SEED DATA
const seedData = async () => {
    // Check if data exists
    const userCount = db.prepare('SELECT count(*) as count FROM users').get();
    if (userCount.count > 0) {
        console.log('Database already seeded.');
        return;
    }

    console.log('Seeding data...');

    // Hash passwords
    const salt = bcrypt.genSaltSync(10);
    const passwordUser = bcrypt.hashSync('password123', salt);
    const passwordAdmin = bcrypt.hashSync('admin123', salt);

    // Insert Users
    const insertUser = db.prepare('INSERT INTO users (username, password, role, email, phone) VALUES (?, ?, ?, ?, ?)');
    insertUser.run('john', passwordUser, 'POLICYHOLDER', 'john@example.com', '+91-9876543210');
    insertUser.run('admin', passwordAdmin, 'ADMIN', 'admin@insuretech.com', '+91-9876543211');
    insertUser.run('adjuster', passwordUser, 'ADJUSTER', 'adjuster@insuretech.com', '+91-9876543212');
    insertUser.run('underwriter', passwordUser, 'UNDERWRITER', 'underwriter@insuretech.com', '+91-9876543213');

    // Insert Enhanced Products
    const insertProduct = db.prepare(`
        INSERT INTO products (name, type, category, base_price, description, coverage_min, coverage_max, features, terms) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Vehicle Insurance
    insertProduct.run(
        'Comprehensive Car Insurance',
        'VEHICLE',
        'AUTO',
        5000,
        'Complete protection for your vehicle including third-party liability, own damage, and theft coverage',
        100000,
        5000000,
        JSON.stringify(['Own Damage Cover', 'Third Party Liability', 'Personal Accident Cover', 'Zero Depreciation', 'Roadside Assistance']),
        JSON.stringify(['Policy Term: 1 Year', 'Renewable', 'Cashless Garages: 4500+', 'No Claim Bonus: Up to 50%'])
    );

    insertProduct.run(
        'Two Wheeler Insurance',
        'VEHICLE',
        'BIKE',
        1500,
        'Affordable insurance for your two-wheeler with comprehensive coverage',
        50000,
        500000,
        JSON.stringify(['Own Damage', 'Third Party', 'Personal Accident', 'Accessories Cover']),
        JSON.stringify(['Policy Term: 1 Year', 'Instant Policy', 'Cashless Claims'])
    );

    // Health Insurance
    insertProduct.run(
        'Family Health Shield',
        'HEALTH',
        'MEDICAL',
        8000,
        'Comprehensive health coverage for you and your family',
        200000,
        10000000,
        JSON.stringify(['Hospitalization Cover', 'Pre & Post Hospitalization', 'Day Care Procedures', 'Ambulance Charges', 'No Claim Bonus']),
        JSON.stringify(['Policy Term: 1 Year', 'Cashless Hospitals: 10000+', 'Lifetime Renewability', 'Tax Benefits u/s 80D'])
    );

    insertProduct.run(
        'Senior Citizen Health Plan',
        'HEALTH',
        'SENIOR',
        15000,
        'Specialized health insurance for senior citizens with pre-existing disease cover',
        300000,
        5000000,
        JSON.stringify(['Pre-existing Disease Cover', 'No Medical Tests', 'Domiciliary Hospitalization', 'AYUSH Treatment']),
        JSON.stringify(['Age: 60-80 years', 'Lifetime Renewability', 'Waiting Period: 2 years for pre-existing'])
    );

    // Life Insurance
    insertProduct.run(
        'Term Life Insurance',
        'LIFE',
        'TERM',
        10000,
        'Pure life protection with high coverage at affordable premiums',
        1000000,
        50000000,
        JSON.stringify(['Death Benefit', 'Terminal Illness Benefit', 'Accidental Death Benefit', 'Tax Benefits']),
        JSON.stringify(['Policy Term: 10-40 years', 'Tax Free Maturity', 'Flexible Premium Payment'])
    );

    insertProduct.run(
        'Whole Life Insurance',
        'LIFE',
        'WHOLE_LIFE',
        25000,
        'Lifetime protection with savings component',
        500000,
        10000000,
        JSON.stringify(['Lifetime Coverage', 'Maturity Benefit', 'Loan Facility', 'Bonus Additions']),
        JSON.stringify(['Coverage till 100 years', 'Guaranteed Returns', 'Premium Payment: Limited/Regular'])
    );

    console.log('Database initialized successfully with enhanced schema!');
};

seedData();
