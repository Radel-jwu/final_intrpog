const db = require('./dbconnect');

async function updateRequestsToAwaitingApproval() {
  try {
    console.log('Updating all pending requests to awaiting approval...');
    
    // Update all pending requests to awaiting approval
    const [updateResult] = await db.query(
      'UPDATE requests SET status = 4 WHERE status = 1'
    );
    
    console.log(`Updated ${updateResult.affectedRows} requests to awaiting approval.`);
    
    // Get counts of requests by status
    const [countRows] = await db.query(`
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
    
    console.log('\nCurrent request status counts:');
    countRows.forEach(row => {
      console.log(`${statusMap[row.status] || `Unknown (${row.status})`}: ${row.count}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating requests:', error);
    process.exit(1);
  }
}

// Run the update
updateRequestsToAwaitingApproval(); 