const express = require('express');
const router = express.Router();
const db = require('../../dbconnect'); // Adjust the path as needed
const bcrypt = require('bcrypt');
const { auth, authorize } = require('../../middleware/auth');

// Import login route
const loginRoute = require('./login');

// Use login route
router.use('/login', loginRoute);

// GET all accounts (protected, admin only)
router.get('/', authorize(['admin']), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM accounts');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching accounts:', error.message);
    res.status(500).json({ message: 'Failed to retrieve accounts', error: error.message });
  }
});

// GET account by ID (protected)
router.get('/:id', auth, async (req, res) => {
  const id = req.params.id;
  
  // Only allow users to access their own account unless they're an admin
  if (req.user.id !== id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: you can only access your own account' });
  }
  
  try {
    const [rows] = await db.query('SELECT * FROM accounts WHERE acc_id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching account:', error.message);
    res.status(500).json({ message: 'Failed to retrieve account', error: error.message });
  }
});

// POST create new account
router.post('/', async (req, res) => {
  const { email, password, role = 'user' } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  try {
    // Check if email already exists
    const [existingUsers] = await db.query('SELECT * FROM accounts WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new account
    const [result] = await db.query(
      'INSERT INTO accounts (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );
    
    res.status(201).json({ 
      message: 'Account created successfully',
      acc_id: result.insertId
    });
  } catch (error) {
    console.error('Error creating account:', error.message);
    res.status(500).json({ message: 'Failed to create account', error: error.message });
  }
});

// PUT update account (protected)
router.put('/:id', auth, async (req, res) => {
  const id = req.params.id;
  const { email, password, role, title, firstname, lastname, status } = req.body;
  
  // Only allow users to update their own account unless they're an admin
  if (req.user.id !== id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: you can only update your own account' });
  }
  
  // Only admin can update roles
  if (role && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: only admins can change roles' });
  }
  
  try {
    let updateFields = [];
    let params = [];
    
    if (title) {
      updateFields.push('title = ?');
      params.push(title);
    }
    
    if (firstname) {
      updateFields.push('firstname = ?');
      params.push(firstname);
    }
    
    if (lastname) {
      updateFields.push('lastname = ?');
      params.push(lastname);
    }
    
    if (email) {
      updateFields.push('email = ?');
      params.push(email);
    }
    
    if (password) {
      // Fetch current password hash
      const [rows] = await db.query('SELECT password FROM accounts WHERE acc_id = ?', [id]);
      const currentHash = rows[0]?.password;
      if (password === currentHash) {
        // Do not update password field, it's the same hash
      } else {
        // Hash only if it's a new plain password
        const hashedPassword = await bcrypt.hash(password, 10);
        updateFields.push('password = ?');
        params.push(hashedPassword);
      }
    }
    
    if (role) {
      updateFields.push('role = ?');
      params.push(role);
    }
    
    if (status) {
      updateFields.push('status = ?');
      params.push(status);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    params.push(id);
    
    const [result] = await db.query(
      `UPDATE accounts SET ${updateFields.join(', ')} WHERE acc_id = ?`,
      params
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    res.json({ message: 'Account updated successfully' });
  } catch (error) {
    console.error('Error updating account:', error.message);
    res.status(500).json({ message: 'Failed to update account', error: error.message });
  }
});

// DELETE account (protected, admin only)
router.delete('/:id', authorize(['admin']), async (req, res) => {
  const id = req.params.id;
  
  try {
    // Check if there are any employees linked to this account
    const [employees] = await db.query('SELECT * FROM employees WHERE acc_id = ?', [id]);
    
    if (employees.length > 0) {
      return res.status(409).json({ 
        message: 'Cannot delete account with linked employees. Remove employee records first.' 
      });
    }
    
    const [result] = await db.query('DELETE FROM accounts WHERE acc_id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error.message);
    res.status(500).json({ message: 'Failed to delete account', error: error.message });
  }
});

module.exports = router;
