const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

exports.register = (req, res) => {
    const { username, password, role } = req.body;

    // Simple validation
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    try {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        //userRole to POLYCYHOLDER if not provided
        // Default role to POLICYHOLDER if not provided
        const userRole = role || 'POLICYHOLDER';

        UserModel.createUser(username, hashedPassword, userRole);
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: "Username likely already exists" });
    }
};
// Login controller - Authenticates user using username & password
exports.login = (req, res) => {
    const { username, password } = req.body;
// Extract username and password from request body
    const user = UserModel.findByUsername(username);
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
 // If user not found -> return invalid credentials
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
 // If password doesn't match -> return invalid credentials
    // Create JWT Token
    const token = jwt.sign(
        { id: user.id, role: user.role, username: user.username },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' }
    );

    res.json({ token, role: user.role, username: user.username });
};
