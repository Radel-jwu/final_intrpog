const express = require('express');
const router = express.Router();
const db = require('../../dbconnect'); // Should be using mysql2/promise connection pool

// Get all departments
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM departments');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get department by ID
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.query('SELECT * FROM departments WHERE dept_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching department:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update department
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { name, description } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE departments SET name = ?, description = ? WHERE dept_id = ?',
      [name, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({ message: 'Department updated successfully' });
  } catch (err) {
    console.error('Error updating department:', err);
    res.status(500).json({ error: 'Failed to update department' });
  }
});

// Add new department
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  const employeeCount = 0;

  if (!name) {
    return res.status(400).json({ error: 'Department name is required' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO departments (name, description, employeeCount) VALUES (?, ?, ?)',
      [name, description, employeeCount]
    );
    res.status(201).json({ message: 'Department added', id: result.insertId });
  } catch (err) {
    console.error('Error adding department:', err);
    res.status(500).json({ error: 'Failed to insert department' });
  }
});

module.exports = router;
