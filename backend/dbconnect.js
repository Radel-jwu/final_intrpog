const mysql = require('mysql2/promise');

// Create a connection pool with retry logic
const pool = mysql.createPool({
  host: process.env.DB_HOST || '153.92.15.31',
  user: process.env.DB_USER || 'u875409848_munoz',
  password: process.env.DB_PASSWORD || '9T2Z5$3UKkgSYzE',
  database: process.env.DB_NAME || 'u875409848_munoz',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function tableExists(db, tableName) {
  const [rows] = await db.query(
    "SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?",
    [process.env.DB_NAME || 'u875409848_munoz', tableName]
  );
  return rows[0].count > 0;
}

async function initializeDatabase() {
  const connection = await pool.getConnection();

  try {
    // Create tables
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS accounts (
        acc_id INT(11) NOT NULL AUTO_INCREMENT,
        title TEXT DEFAULT NULL,
        firstname TEXT DEFAULT NULL,
        lastname TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL,
        PRIMARY KEY (acc_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS departments (
        dept_id INT(11) NOT NULL AUTO_INCREMENT,
        emp_id INT(11) DEFAULT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        employeeCount INT(11) DEFAULT NULL,
        PRIMARY KEY (dept_id),
        KEY emp_id (emp_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employees (
        emp_id INT(11) NOT NULL AUTO_INCREMENT,
        acc_id INT(11) DEFAULT NULL,
        dept_id INT(11) DEFAULT NULL,
        email TEXT NOT NULL,
        department TEXT NOT NULL,
        position TEXT NOT NULL,
        date DATE NOT NULL,
        status TEXT NOT NULL,
        role TEXT NOT NULL,
        PRIMARY KEY (emp_id),
        KEY acc_id (acc_id),
        KEY dept_id (dept_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS requests (
        req_id INT(11) NOT NULL AUTO_INCREMENT,
        emp_id INT(11) NOT NULL,
        type TEXT NOT NULL,
        items TEXT NOT NULL,
        status TEXT NOT NULL,
        PRIMARY KEY (req_id),
        KEY emp_id (emp_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Add workflows table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS workflows (
        workflow_id INT(11) NOT NULL AUTO_INCREMENT,
        emp_id INT(11) NOT NULL,
        type TEXT NOT NULL,
        details TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (workflow_id),
        KEY emp_id (emp_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log("✅ Tables created and data inserted conditionally.");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    connection.release();
  }
}

// Initialize the database with retry logic
async function initializeWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await initializeDatabase();
      console.log('✅ Database initialization successful');
      return;
    } catch (error) {
      console.error(`❌ Attempt ${i + 1} failed:`, error.message);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
    }
  }
}

// Test connection and initialize
testConnection().then(success => {
  if (success) {
    initializeWithRetry();
  }
});

// Export the pool for use in other files
module.exports = pool;



