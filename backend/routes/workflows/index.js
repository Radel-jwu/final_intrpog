const express = require('express');
const router = express.Router();
const pool = require('../../dbconnect');
const { auth, authorize } = require('../../middleware/auth');

// Get all workflows (Admin only)
router.get('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const [workflows] = await pool.query('SELECT * FROM workflows ORDER BY created_at DESC');
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get workflows for specific employee
router.get('/employee/:empId', auth, async (req, res) => {
  try {
    const [workflows] = await pool.query(
      'SELECT * FROM workflows WHERE emp_id = ? ORDER BY created_at DESC',
      [req.params.empId]
    );
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new workflow (Admin only)
router.post('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const { emp_id, type, details, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO workflows (emp_id, type, details, status) VALUES (?, ?, ?, ?)',
      [emp_id, type, details, status]
    );
    res.status(201).json({ id: result.insertId, message: 'Workflow created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update workflow status (Admin only)
router.put('/:id/status', auth, authorize(['admin']), async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query(
      'UPDATE workflows SET status = ? WHERE workflow_id = ?',
      [status, req.params.id]
    );
    res.json({ message: 'Workflow status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create onboarding workflow (Admin only)
router.post('/onboarding', auth, authorize(['admin']), async (req, res) => {
  try {
    const { emp_id } = req.body;
    const onboardingSteps = [
      {
        type: 'Onboarding',
        details: 'Task: Complete HR Forms (Step 1)',
        status: 'Pending'
      },
      {
        type: 'Onboarding',
        details: 'Task: Setup Workstation (Step 2)',
        status: 'Pending'
      },
      {
        type: 'Onboarding',
        details: 'Task: Department Orientation (Step 3)',
        status: 'Pending'
      }
    ];

    for (const step of onboardingSteps) {
      await pool.query(
        'INSERT INTO workflows (emp_id, type, details, status) VALUES (?, ?, ?, ?)',
        [emp_id, step.type, step.details, step.status]
      );
    }

    res.status(201).json({ message: 'Onboarding workflow created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 