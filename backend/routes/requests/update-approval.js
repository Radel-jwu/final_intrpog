const express = require('express');
const router = express.Router();
const db = require('../../dbconnect');

// Endpoint to update all pending requests to awaiting approval
router.post('/set-awaiting-approval', async (req, res) => {
  try {
    const [result] = await db.query(
      'UPDATE requests SET status = 4 WHERE status = 1'
    );
    
    res.json({
      message: 'Requests updated successfully',
      updatedCount: result.affectedRows
    });
  } catch (error) {
    console.error('Error updating requests:', error);
    res.status(500).json({ message: 'Failed to update requests' });
  }
});

// Endpoint to get counts of requests by status
router.get('/status-counts', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT status, COUNT(*) as count
      FROM requests
      GROUP BY status
      ORDER BY status
    `);
    
    // Map status codes to readable values
    const statusMap = {
      1: 'Pending',
      2: 'Approved',
      3: 'Rejected',
      4: 'Awaiting Approval',
      5: 'Completed'
    };
    
    const counts = rows.map(row => ({
      status: statusMap[row.status] || `Unknown (${row.status})`,
      count: row.count
    }));
    
    res.json(counts);
  } catch (error) {
    console.error('Error fetching request counts:', error);
    res.status(500).json({ message: 'Failed to fetch request counts' });
  }
});

module.exports = router; 