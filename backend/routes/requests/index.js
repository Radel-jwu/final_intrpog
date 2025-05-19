const express = require('express');
const router = express.Router();
const db = require('../../dbconnect');

// Get all requests
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.req_id, r.emp_id, r.type, r.items, r.status, 
             e.email as employee_email 
      FROM requests r
      LEFT JOIN employees e ON r.emp_id = e.emp_id
    `);
    
    // Map status codes to readable values
    const requests = rows.map(row => ({
      id: row.req_id,
      emp_id: row.emp_id,
      type: mapType(row.type),
      employee: row.employee_email,
      items: row.items,
      status: mapStatus(row.status)
    }));
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
});

// Get request by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM requests WHERE req_id = ?', 
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    const request = rows[0];
    res.json({
      id: request.req_id,
      emp_id: request.emp_id,
      type: mapType(request.type),
      items: request.items,
      status: mapStatus(request.status)
    });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ message: 'Failed to fetch request' });
  }
});

// Create a new request
router.post('/', async (req, res) => {
  const { emp_id, type, items, status = 1 } = req.body; // Default status is 1 (Pending)
  
  // Validate required fields
  if (!emp_id || !type || !items) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  try {
    // Convert type from string to number if needed
    const typeValue = typeof type === 'string' ? getTypeValue(type) : type;
    
    // Convert status from string to number if needed
    const statusValue = typeof status === 'string' ? getStatusValue(status) : status;
    
    const [result] = await db.query(
      'INSERT INTO requests (emp_id, type, items, status) VALUES (?, ?, ?, ?)',
      [emp_id, typeValue, items, statusValue]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      emp_id,
      type: mapType(typeValue),
      items,
      status: mapStatus(statusValue)
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Failed to create request' });
  }
});

// Update request
router.put('/:id', async (req, res) => {
  const { emp_id, type, items, status } = req.body;
  const requestId = req.params.id;
  
  try {
    // Convert type and status to numeric values if they're strings
    const typeValue = type ? (typeof type === 'string' ? getTypeValue(type) : type) : undefined;
    const statusValue = status ? (typeof status === 'string' ? getStatusValue(status) : status) : undefined;
    
    // Build dynamic query based on provided fields
    let query = 'UPDATE requests SET ';
    const values = [];
    const updateFields = [];
    
    if (emp_id !== undefined) {
      updateFields.push('emp_id = ?');
      values.push(emp_id);
    }
    
    if (typeValue !== undefined) {
      updateFields.push('type = ?');
      values.push(typeValue);
    }
    
    if (items !== undefined) {
      updateFields.push('items = ?');
      values.push(items);
    }
    
    if (statusValue !== undefined) {
      updateFields.push('status = ?');
      values.push(statusValue);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    query += updateFields.join(', ');
    query += ' WHERE req_id = ?';
    values.push(requestId);
    
    const [result] = await db.query(query, values);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json({ message: 'Request updated successfully' });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Failed to update request' });
  }
});

// Delete request
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM requests WHERE req_id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ message: 'Failed to delete request' });
  }
});

// Helper functions for mapping request types
function mapType(typeValue) {
  const types = {
    1: 'Equipment',
    2: 'Leave',
    3: 'Training'
  };
  return types[typeValue] || 'Unknown';
}

function getTypeValue(typeString) {
  const typeMap = {
    'Equipment': 1,
    'Leave': 2,
    'Training': 3
  };
  return typeMap[typeString] || 1;
}

// Helper functions for mapping request statuses
function mapStatus(statusValue) {
  const statuses = {
    1: 'Pending',
    2: 'Approved',
    3: 'Rejected'
  };
  return statuses[statusValue] || 'Unknown';
}

function getStatusValue(statusString) {
  const statusMap = {
    'Pending': 1,
    'Approved': 2,
    'Rejected': 3
  };
  return statusMap[statusString] || 1;
}

module.exports = router;
