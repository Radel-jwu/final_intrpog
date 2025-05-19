const mysql = require('mysql2/promise');
const config = require('./config.json');

// Create a connection pool
const pool = mysql.createPool(config.database);

async function tableExists(db, tableName) {
  const [rows] = await db.query(
    "SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?",
    [config.database.database, tableName]
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

    console.log("✅ Tables created and data inserted conditionally.");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    connection.release();
  }
}

// Initialize the database
initializeDatabase();

// Export the pool for use in other files
module.exports = pool;



