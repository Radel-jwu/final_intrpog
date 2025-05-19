const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const departmentsRouter = require('./routes/departments');
const accountsRouter = require('./routes/accounts');
const employeesRouter = require('./routes/employees');
const requestsRouter = require('./routes/requests');
const workflowsRouter = require('./routes/workflows');
const requestApprovalRouter = require('./routes/requests/update-approval');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // For JSON
app.use(express.urlencoded({ extended: true })); // For form submissions

app.use(cors());
app.use(bodyParser.json());

app.use('/api/departments', departmentsRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/request-approval', requestApprovalRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
