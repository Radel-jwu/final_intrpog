const db = require('../dbconnect');
const bcrypt = require('bcrypt');

async function createAdminAccount() {
  const connection = await db.getConnection(); // Get connection from pool

  try {
    // Check if the admin account already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM accounts WHERE email = ?',
      ['chrisnino@gmail.com']
    );

    if (existingUsers.length > 0) {
      console.log('Admin account already exists.');
      return;
    }

    // Hash the password 'pagente123'
    const hashedPassword = await bcrypt.hash('pagente123', 10);

    // Insert the admin account
    const [result] = await connection.execute(
      'INSERT INTO accounts (email, password, role, status, lastname) VALUES (?, ?, ?, ?, ?)',
      ['chrisnino@gmail.com', hashedPassword, 'admin', 'Active', 'Admin']
    );

    console.log('✅ Admin account created with ID:', result.insertId);
    console.log('Email: chrisnino@gmail.com');
    console.log('Password: pagente123');

    // Optional: Insert employee record
    try {
      await connection.execute(
        'INSERT INTO employees (acc_id, email, department, dept_id, position, date, status, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          result.insertId,
          'chrisnino@gmail.com',
          'IT',
          2, // dept_id for IT (adjust as needed)
          'System Administrator',
          new Date(),
          'Active',
          'Admin'
        ]
      );
      console.log('✅ Employee record created for admin account');
    } catch (e) {
      console.warn('⚠️ Could not create employee record:', e.message);
    }

  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
  } finally {
    connection.release(); // Release back to pool
    process.exit(0);
  }
}

createAdminAccount();
