const express = require('express');
const router = express.Router();
const db = require('../../dbconnect');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// JWT secret key (store in environment variables for production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Login endpoint
router.post('/', async (req, res) => {
  const { email, password } = req.body;
  console.log('===========================================');
  console.log('LOGIN ATTEMPT');
  console.log('Email:', email);
  console.log('Password length:', password ? password.length : 0);
  console.log('===========================================');

  if (!email || !password) {
    console.log('Missing email or password');
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Get user from database
    console.log('Querying database for user:', email);
    
    // Use case-insensitive query for email
    const [users] = await db.query('SELECT * FROM accounts WHERE LOWER(email) = LOWER(?)', [email]);
    console.log('Found users:', users.length);

    if (users.length === 0) {
      console.log('No user found with email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    console.log('User found:');
    console.log('- ID:', user.acc_id);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Password hash (first 10 chars):', user.password ? user.password.substring(0, 10) + '...' : 'MISSING');
    console.log('- Password hash length:', user.password ? user.password.length : 0);

    // Check if password exists and has valid format
    if (!user.password) {
      console.error('ERROR: User has no password hash stored!');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.password.startsWith('$2')) {
      console.error('ERROR: Stored password is not a valid bcrypt hash!');
      console.log('Invalid hash:', user.password);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    console.log('Comparing password...');
    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password valid:', isPasswordValid);

      if (!isPasswordValid) {
        console.log('Invalid password for user:', email);
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (bcryptError) {
      console.error('bcrypt.compare ERROR:', bcryptError.message);
      return res.status(500).json({ message: 'Authentication error', error: bcryptError.message });
    }

    // Generate JWT token
    console.log('Generating JWT token');
    const token = jwt.sign(
      { 
        id: user.acc_id,
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    console.log('Token generated successfully');

    // Return user info and token
    res.json({
      acc_id: user.acc_id,
      email: user.email,
      role: user.role,
      token
    });
    console.log('Login successful for user:', email);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error occurred during login', error: error.message });
  }
});

module.exports = router; 