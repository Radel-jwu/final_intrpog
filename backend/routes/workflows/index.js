const express = require('express');
const router = express.Router();
const db = require('../../dbconnect');


// Create a new workflow (creates a request entry)
router.post('/', async (req, res) => {
  try {
    let { employeeId, type, details, status = 'Pending' } = req.body;
    
    if (!employeeId || !type || !details) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if employeeId is in EMP001 format and convert to numeric if needed
    if (typeof employeeId === 'string' && employeeId.toUpperCase().startsWith('EMP')) {
      // Extract the numeric part
      const numericPart = employeeId.substring(3);
      if (!isNaN(parseInt(numericPart))) {
        employeeId = parseInt(numericPart);
      }
    }
    
    // Convert workflow type to request type
    const requestType = mapWorkflowTypeToType(type);
    
    // Convert workflow status to request status
    const requestStatus = mapWorkflowStatusToStatus(status);
    
    // Insert into requests table
    const [result] = await db.query(
      'INSERT INTO requests (emp_id, type, items, status) VALUES (?, ?, ?, ?)',
      [employeeId, requestType, details, requestStatus]
    );
    
    // Return created workflow
    res.status(201).json({
      id: result.insertId,
      employeeId,
      type,
      details,
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ message: 'Failed to create workflow' });
  }
});

// Update workflow status (updates request status)
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const workflowId = req.params.id;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Get current status before updating
    const [currentStatusRows] = await db.query(
      'SELECT status FROM requests WHERE req_id = ?',
      [workflowId]
    );
    
    if (currentStatusRows.length === 0) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    const currentStatus = currentStatusRows[0].status;
    const currentStatusText = mapStatusToWorkflowStatus(currentStatus);
    
    // Convert workflow status to request status
    const requestStatus = mapWorkflowStatusToStatus(status);
    
    // Update in requests table
    const [result] = await db.query(
      'UPDATE requests SET status = ? WHERE req_id = ?',
      [requestStatus, workflowId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    // Log status change in history table if available
    // This would typically be done in a more complex application
    try {
      await db.query(
        'INSERT INTO status_history (req_id, old_status, new_status, change_date) VALUES (?, ?, ?, NOW())',
        [workflowId, currentStatus, requestStatus]
      );
    } catch (logError) {
      console.warn('Could not log status change to history table:', logError);
      // Continue processing even if logging fails
    }
    
    // Special handling for specific statuses
    let statusMessage = 'Workflow status updated successfully';
    
    if (status === 'Pending') {
      statusMessage = 'Workflow has been reset to Pending status';
    } else if (status === 'Completed') {
      statusMessage = 'Workflow has been marked as Completed';
    } else if (status === 'Cancelled') {
      statusMessage = 'Workflow has been Cancelled';
    }
    
    res.json({ 
      message: statusMessage,
      oldStatus: currentStatusText,
      newStatus: status
    });
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({ message: 'Failed to update workflow' });
  }
});

// Helper functions for mapping types
function mapTypeToWorkflowType(typeValue) {
  const typeMap = {
    1: 'Equipment',
    2: 'Leave',
    3: 'Training'
  };
  return typeMap[typeValue] || 'Other';
}

function mapWorkflowTypeToType(workflowType) {
  const typeMap = {
    'Equipment': 1,
    'Leave': 2,
    'Training': 3,
    'Onboarding': 1,  // Map to Equipment for now
    'Review': 3,      // Map to Training for now
    'Offboarding': 2  // Map to Leave for now
  };
  return typeMap[workflowType] || 1;
}

// Helper functions for mapping status
function mapStatusToWorkflowStatus(statusValue) {
  const statusMap = {
    1: 'Pending',
    2: 'Approved',
    3: 'Rejected',
    4: 'Awaiting Approval',
    5: 'Completed'
  };
  return statusMap[statusValue] || 'Pending';
}

function mapWorkflowStatusToStatus(workflowStatus) {
  const statusMap = {
    'Pending': 1,
    'In Progress': 1,            // Map to Pending for now
    'Awaiting Approval': 4,      // New status
    'Approved': 2,
    'Rejected': 3,
    'Completed': 5,             // Separate from Approved
    'Cancelled': 3              // Map to Rejected
  };
  return statusMap[workflowStatus] || 1;
}

router.get('/:empId', async (req, res) => {
  try {
    let empId = req.params.empId;

    // If format is EMP015, strip prefix
    if (typeof empId === 'string' && empId.toUpperCase().startsWith('EMP')) {
      const num = parseInt(empId.substring(3), 10);
      if (!isNaN(num)) empId = num;
    }

    const [rows] = await db.query(`
      SELECT
        emp_id      AS employeeId,
        type        AS rawType,
        details     AS details,
        status      AS rawStatus
      FROM workflows
      WHERE emp_id = ?
    `, [empId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No workflows found for this employee' });
    }

    const workflows = rows.map(r => ({
      employeeId: r.employeeId,
      type:       mapTypeToWorkflowType(r.rawType),
      details:    r.details,
      status:     mapStatusToWorkflowStatus(r.rawStatus)
    }));

    res.json(workflows);
  } catch (err) {
    console.error('Error fetching workflows for employee:', err);
    res.status(500).json({ message: 'Failed to fetch workflows' });
  }
});

router.post('/', (req, res) => {
  const { employeeId, type, details, status } = req.body;

  if (!employeeId || !type || !details || !status) {
    return res.status(400).json({ error: 'Missing required workflow fields' });
  }

  const query = `
    INSERT INTO workflows (employee_id, type, details, status)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(query, [employeeId, type, details, status], (err, result) => {
    if (err) {
      console.error('Error inserting workflow:', err);
      return res.status(500).json({ error: 'Failed to create workflow' });
    }

    const newWorkflow = {
      id: result.insertId,
      employeeId,
      type,
      details,
      status
    };

    res.status(201).json(newWorkflow);
  });
});




module.exports = router; 