const express = require('express');
const router = express.Router();
const db = require('../../dbconnect'); // Using mysql2/promise connection

// GET all employees
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.emp_id,
             e.acc_id,
             a.email,
             e.department,
             e.dept_id,
             e.position,
             e.date AS hire_date,
             e.status
      FROM employees e
      LEFT JOIN accounts a ON e.acc_id = a.acc_id
    `);

    // Format date objects properly
    const employees = rows.map(row => ({
      ...row,
      hire_date: row.hire_date ? new Date(row.hire_date) : null
    }));

    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error.message);
    res.status(500).json({ message: 'Failed to retrieve employees', error: error.message });
  }
});

// GET employee by ID
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    const [rows] = await db.query(`
      SELECT 
        e.emp_id,
        e.acc_id,
        a.email,
        e.department,
        e.dept_id,
        d.name AS department_name,
        e.position,
        e.date AS hire_date,
        e.status
      FROM 
        employees e
      LEFT JOIN 
        accounts a ON e.acc_id = a.acc_id
      LEFT JOIN 
        departments d ON e.dept_id = d.dept_id
      WHERE e.emp_id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Format the date
    const employee = {
      ...rows[0],
      hire_date: rows[0].hire_date ? new Date(rows[0].hire_date) : null
    };

    res.json(employee);
  } catch (err) {
    console.error('Error fetching employee by ID:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { acc_id, email, position, department, dept_id, hire_date, status } = req.body;

  if (!acc_id || !email || !position || !department || !dept_id || !hire_date || !status) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // 1) Start transaction
    await db.query('START TRANSACTION');

    // 2) Insert new employee
    const sqlInsertEmployee = `
      INSERT INTO employees (acc_id, email, position, department, dept_id, date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [empResult] = await db.execute(sqlInsertEmployee, [
      acc_id,
      email,
      position,
      department,
      dept_id,
      hire_date,
      status
    ]);

    const newEmpId = empResult.insertId;

    // 3) Insert onboarding workflow for this employee
    await db.query(
      `INSERT INTO workflows (emp_id, type, details, status)
       VALUES (?, ?, ?, ?)`,
      [
        newEmpId,
        'Onboarding',                           // workflow type
        'Task: Complete HR Forms (Step 1)',    // details
        'Pending'                              // status
      ]
    );

    // 4) Increment employeeCount in departments
    await db.execute(
      `UPDATE departments
       SET employeeCount = employeeCount + 1
       WHERE dept_id = ?`,
      [dept_id]
    );

    // 5) Commit if all good
    await db.query('COMMIT');

    res.status(201).json({
      message: 'Employee added and onboarding workflow initialized.',
      emp_id: newEmpId
    });
  } catch (error) {
    // Roll back on any error
    await db.query('ROLLBACK');
    console.error('DB insert error:', error);
    res.status(500).json({ message: 'Database insertion failed', error: error.message });
  }
});


// PUT update employee - complete update
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { acc_id, email, dept_id, department, position, hire_date, status } = req.body;

  if (!acc_id || !position || !dept_id || !hire_date || !status) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  try {
    // Start a transaction
    await db.query('START TRANSACTION');
    
    // Get the current employee data to check if department changed
    const [currentEmp] = await db.query('SELECT dept_id FROM employees WHERE emp_id = ?', [id]);
    
    if (currentEmp.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const oldDeptId = currentEmp[0].dept_id;
    
    // Update the employee record
    const [result] = await db.query(
      'UPDATE employees SET acc_id = ?, email = ?, dept_id = ?, department = ?, position = ?, date = ?, status = ? WHERE emp_id = ?',
      [acc_id, email, dept_id, department, position, hire_date, status, id]
    );

    if (result.affectedRows === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // If department changed, update department counts
    if (oldDeptId !== dept_id) {
      // Decrement old department count
      await db.query(
        'UPDATE departments SET employeeCount = GREATEST(0, employeeCount - 1) WHERE dept_id = ?',
        [oldDeptId]
      );
      
      // Increment new department count
      await db.query(
        'UPDATE departments SET employeeCount = employeeCount + 1 WHERE dept_id = ?',
        [dept_id]
      );
    }
    
    // Commit the transaction
    await db.query('COMMIT');

    res.json({ 
      message: 'Employee updated successfully',
      emp_id: id
    });
  } catch (err) {
    // Rollback in case of error
    await db.query('ROLLBACK');
    console.error('Error updating employee:', err);
    res.status(500).json({ message: 'Failed to update employee', error: err.message });
  }
});

// PATCH update employee department
router.patch('/:id', async (req, res) => {
  const id = req.params.id;
  const { department } = req.body;

  if (!department) {
    return res.status(400).json({ message: 'Department is required' });
  }

  try {
    // First, find the department ID based on the department name
    const [deptRows] = await db.query('SELECT dept_id FROM departments WHERE name = ?', [department]);
    
    if (deptRows.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const dept_id = deptRows[0].dept_id;
    
    // Get the current department of the employee
    const [empRows] = await db.query('SELECT dept_id FROM employees WHERE emp_id = ?', [id]);
    
    if (empRows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const oldDeptId = empRows[0].dept_id;
    
    // If the department hasn't changed, no need to update
    if (oldDeptId === dept_id) {
      return res.json({ 
        message: 'Employee is already in this department',
        department: department,
        dept_id: dept_id
      });
    }
    
    // Start a transaction to ensure all updates are atomic
    await db.query('START TRANSACTION');
    
    // Update the employee's department
    const [updateResult] = await db.query(
      'UPDATE employees SET dept_id = ?, department = ? WHERE emp_id = ?',
      [dept_id, department, id]
    );
    
    if (updateResult.affectedRows === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Decrement employee count in old department
    await db.query(
      'UPDATE departments SET employeeCount = GREATEST(0, employeeCount - 1) WHERE dept_id = ?',
      [oldDeptId]
    );
    
    // Increment employee count in new department
    await db.query(
      'UPDATE departments SET employeeCount = employeeCount + 1 WHERE dept_id = ?',
      [dept_id]
    );
    
    // Commit the transaction
    await db.query('COMMIT');
    
    res.json({ 
      message: 'Employee department updated successfully',
      department: department,
      dept_id: dept_id
    });
  } catch (err) {
    // Rollback in case of error
    await db.query('ROLLBACK');
    console.error('Error updating employee department:', err);
    res.status(500).json({ message: 'Failed to update employee department', error: err.message });
  }
});

// DELETE employee
router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    // Start a transaction
    await db.query('START TRANSACTION');
    
    // Get the employee's department before deleting
    const [empRows] = await db.query('SELECT dept_id FROM employees WHERE emp_id = ?', [id]);
    
    if (empRows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const deptId = empRows[0].dept_id;
    
    // Delete the employee
    const [result] = await db.query('DELETE FROM employees WHERE emp_id = ?', [id]);

    if (result.affectedRows === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Update department count
    await db.query(
      'UPDATE departments SET employeeCount = GREATEST(0, employeeCount - 1) WHERE dept_id = ?',
      [deptId]
    );
    
    // Commit the transaction
    await db.query('COMMIT');

    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    // Rollback in case of error
    await db.query('ROLLBACK');
    console.error('Error deleting employee:', err);
    res.status(500).json({ message: 'Failed to delete employee', error: err.message });
  }
});

module.exports = router;
