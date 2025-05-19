const db = require('../dbconnect');
const bcrypt = require('bcrypt');

async function createFreshAdmin() {
  try {
    console.log('Creating a completely fresh admin account...');
    
    // New admin details
    const adminEmail = 'newadmin@example.com';
    const adminPassword = 'admin123';
    
    // First, check the password column type
    console.log('Checking accounts table structure...');
    try {
      const [columns] = await db.query('SHOW COLUMNS FROM accounts WHERE Field = ?', ['password']);
      if (columns.length > 0) {
        console.log('Password column details:', columns[0]);
        
        // Check if the column type is large enough
        const isTypeOk = columns[0].Type.includes('varchar') || columns[0].Type.includes('text');
        const sizeMatches = /varchar\((\d+)\)/.exec(columns[0].Type);
        
        if (!isTypeOk) {
          console.error('ERROR: Password column is not varchar or text type!');
          console.log('Please modify your accounts table to use VARCHAR(255) for the password column.');
          return;
        }
        
        if (sizeMatches && parseInt(sizeMatches[1]) < 60) {
          console.error(`ERROR: Password column size (${sizeMatches[1]}) is too small for bcrypt hashes!`);
          console.log('Please modify your accounts table to use VARCHAR(255) for the password column.');
          return;
        }
      }
    } catch (error) {
      console.log('Could not check table structure:', error.message);
    }
    
    // Generate proper bcrypt hash
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('Generated password hash (length:', hashedPassword.length, '):', hashedPassword);
    
    // Delete any existing account with this email
    console.log('Removing any existing accounts with the same email...');
    await db.query('DELETE FROM accounts WHERE email = ?', [adminEmail]);
    
    // Create fresh admin account
    console.log('Creating new admin account...');
    const [result] = await db.query(
      'INSERT INTO accounts (email, password, role, firstname, lastname, status) VALUES (?, ?, ?, ?, ?, ?)',
      [adminEmail, hashedPassword, 'admin', 'Admin', 'User', 'Active']
    );
    
    console.log(`New admin account created with ID: ${result.insertId}`);
    
    // Verify the account
    const [verifyUsers] = await db.query('SELECT * FROM accounts WHERE email = ?', [adminEmail]);
    
    if (verifyUsers.length > 0) {
      const admin = verifyUsers[0];
      console.log('\nAdmin account verified:');
      console.log('- ID:', admin.acc_id);
      console.log('- Email:', admin.email);
      console.log('- Role:', admin.role);
      console.log('- First name:', admin.firstname);
      console.log('- Last name:', admin.lastname);
      console.log('- Status:', admin.status);
      console.log('- Password hash length:', admin.password ? admin.password.length : 0);
      
      // Test password verification
      const isMatch = await bcrypt.compare(adminPassword, admin.password);
      console.log('Password verification test:', isMatch ? 'PASS' : 'FAIL');
      
      if (isMatch) {
        console.log('\n========================================');
        console.log('LOGIN WITH THESE CREDENTIALS:');
        console.log('Email: ' + adminEmail);
        console.log('Password: ' + adminPassword);
        console.log('========================================\n');
      } else {
        console.error('ERROR: Password verification failed! The bcrypt compare function is not working as expected.');
      }
    }
    
  } catch (error) {
    console.error('Error creating fresh admin account:', error.message);
  } finally {
    process.exit(0);
  }
}

createFreshAdmin(); 