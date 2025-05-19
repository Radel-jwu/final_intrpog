const db = require('../dbconnect');
const bcrypt = require('bcrypt');

// This script will directly test the login process
async function testLogin() {
  const email = 'admin@example.com';
  const password = 'admin123';
  
  try {
    console.log(`Testing login for: ${email}`);
    
    // 1. Get user from database
    console.log('Fetching user from database...');
    const [users] = await db.query('SELECT * FROM accounts WHERE email = ?', [email]);
    
    if (users.length === 0) {
      console.error('ERROR: User not found in database');
      return;
    }
    
    const user = users[0];
    console.log('User found:', { 
      id: user.acc_id, 
      email: user.email, 
      role: user.role,
      passwordHash: user.password ? `${user.password.substring(0, 10)}...` : 'null'
    });
    
    // 2. Check if password hash exists and is in valid format
    if (!user.password) {
      console.error('ERROR: Password hash is null or missing');
      return;
    }
    
    if (!user.password.startsWith('$2')) {
      console.error('ERROR: Password is not a valid bcrypt hash (should start with $2)');
      console.log('Stored hash:', user.password);
      return;
    }
    
    // 3. Test password comparison
    console.log('Testing password comparison...');
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match result:', isMatch);
      
      if (!isMatch) {
        console.log('Login would fail: password does not match');
        
        // Create a new hash for comparison
        const newHash = await bcrypt.hash(password, 10);
        console.log('New hash for reference:', newHash);
        
        // Update password with new hash
        console.log('Updating password with new hash...');
        const [updateResult] = await db.query(
          'UPDATE accounts SET password = ? WHERE acc_id = ?',
          [newHash, user.acc_id]
        );
        
        console.log('Password updated:', updateResult.affectedRows > 0);
        console.log('Try logging in again with admin@example.com/admin123');
      } else {
        console.log('Login should succeed, but is failing with 401 error.');
        console.log('This may indicate an issue with JWT token generation or routing.');
      }
    } catch (error) {
      console.error('ERROR during bcrypt.compare:', error.message);
    }
    
  } catch (error) {
    console.error('Test login error:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the test
testLogin(); 