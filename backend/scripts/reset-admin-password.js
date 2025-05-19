const db = require('../dbconnect');
const bcrypt = require('bcrypt');

async function resetAdminPassword() {
  try {
    console.log('Resetting admin password...');
    
    // Generate a new bcrypt hash for 'admin123'
    const plainPassword = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    
    console.log('New hashed password generated');
    
    // Update the admin user password
    const [result] = await db.query(
      'UPDATE accounts SET password = ? WHERE email = ?',
      [hashedPassword, 'admin@example.com']
    );
    
    if (result.affectedRows > 0) {
      console.log('Admin password reset successfully');
      console.log('You can now log in with:');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
    } else {
      console.log('No admin account found with email admin@example.com');
    }
    
  } catch (error) {
    console.error('Error resetting admin password:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the function
resetAdminPassword(); 