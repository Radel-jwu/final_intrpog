const db = require('../dbconnect');

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    
    // Test the database connection
    const [result] = await db.query('SELECT 1 + 1 as result');
    console.log('Database connection successful!', result[0]);
    
    // Check if accounts table exists
    try {
      console.log('Checking accounts table...');
      const [accounts] = await db.query('SHOW TABLES LIKE "accounts"');
      
      if (accounts.length === 0) {
        console.error('ERROR: accounts table does not exist');
        console.log('You need to create the accounts table with: acc_id, email, password, role columns');
      } else {
        console.log('accounts table exists');
        
        // Check accounts table structure
        const [columns] = await db.query('SHOW COLUMNS FROM accounts');
        console.log('accounts table columns:', columns.map(col => col.Field));
        
        // Check if any accounts exist
        const [users] = await db.query('SELECT acc_id, email, role FROM accounts LIMIT 5');
        console.log('Existing accounts:', users);
      }
    } catch (error) {
      console.error('Error checking accounts table:', error.message);
    }
    
    // Add a test admin account if none exists
    try {
      console.log('\nChecking for admin account...');
      const [admins] = await db.query('SELECT acc_id, email, role FROM accounts WHERE email = ?', ['admin@example.com']);
      
      if (admins.length === 0) {
        console.log('No admin account found. Creating one...');
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await db.query(
          'INSERT INTO accounts (email, password, role) VALUES (?, ?, ?)',
          ['admin@example.com', hashedPassword, 'admin']
        );
        
        console.log('Admin account created successfully:');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');
      } else {
        console.log('Admin account already exists with id:', admins[0].acc_id);
      }
    } catch (error) {
      console.error('Error creating admin account:', error.message);
    }
    
  } catch (error) {
    console.error('Database connection failed:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the function
checkDatabase(); 