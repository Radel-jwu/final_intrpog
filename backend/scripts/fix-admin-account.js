const db = require('../dbconnect');
const bcrypt = require('bcrypt');

async function fixAdminAccount() {
  try {
    console.log('Starting admin account fix...');
    
    // Generate proper bcrypt hash for 'admin123'
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('New hash generated:', hashedPassword);
    
    // First, check if the account exists
    const [users] = await db.query('SELECT * FROM accounts WHERE email = ?', ['admin@example.com']);
    
    if (users.length > 0) {
      // Update the existing account
      console.log(`Found existing admin account with ID ${users[0].acc_id}, updating...`);
      
      const [updateResult] = await db.query(
        'UPDATE accounts SET password = ?, role = ?, firstname = ?, lastname = ?, status = ? WHERE acc_id = ?',
        [hashedPassword, 'admin', 'Admin', 'User', 'Active', users[0].acc_id]
      );
      
      console.log(`Account updated: ${updateResult.affectedRows > 0}`);
    } else {
      // Create a new admin account
      console.log('No admin account found, creating new one...');
      
      const [insertResult] = await db.query(
        'INSERT INTO accounts (email, password, role, firstname, lastname, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin@example.com', hashedPassword, 'admin', 'Admin', 'User', 'Active']
      );
      
      console.log(`New admin account created with ID: ${insertResult.insertId}`);
    }
    
    // Verify the account
    const [verifyUsers] = await db.query('SELECT acc_id, email, role, password FROM accounts WHERE email = ?', ['admin@example.com']);
    
    if (verifyUsers.length > 0) {
      const adminUser = verifyUsers[0];
      console.log('Admin account verified:');
      console.log('- ID:', adminUser.acc_id);
      console.log('- Email:', adminUser.email);
      console.log('- Role:', adminUser.role);
      console.log('- Password hash length:', adminUser.password ? adminUser.password.length : 0);
      
      // Test password verification
      const isMatch = await bcrypt.compare(password, adminUser.password);
      console.log('Password verification test:', isMatch ? 'PASS' : 'FAIL');
      
      if (!isMatch) {
        console.error('ERROR: Password verification failed!');
      } else {
        console.log('\nYou can now log in with:');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');
      }
    }
    
  } catch (error) {
    console.error('Error fixing admin account:', error.message);
  } finally {
    process.exit(0);
  }
}

fixAdminAccount(); 