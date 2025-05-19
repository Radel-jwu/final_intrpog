import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpHandlerFn } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';

// Mock data
const accounts = [
  { 
    acc_id: 1, 
    email: 'admin@example.com', 
    password: 'admin123', 
    firstname: 'Admin', 
    lastname: 'User', 
    role: 'Admin' 
  },
  { 
    acc_id: 2, 
    email: 'john.doe@example.com', 
    password: 'password123', 
    firstname: 'John', 
    lastname: 'Doe', 
    role: 'User' 
  },
  { 
    acc_id: 3, 
    email: 'jane.smith@example.com', 
    password: 'password123', 
    firstname: 'Jane', 
    lastname: 'Smith', 
    role: 'User' 
  }
];

const departments = [
  { dept_id: 1, name: 'Marketing', description: 'Marketing and Sales Department', employeeCount: 2 },
  { dept_id: 2, name: 'HR', description: 'Human Resources', employeeCount: 1 },
  { dept_id: 3, name: 'IT', description: 'Information Technology', employeeCount: 1 },
  { dept_id: 4, name: 'Finance', description: 'Finance and Accounting', employeeCount: 1 },
  { dept_id: 5, name: 'Operations', description: 'Operations and Logistics', employeeCount: 0 }
];

const employees = [
  { 
    emp_id: 1, 
    acc_id: 1, 
    email: 'admin@example.com', 
    department: 'IT', 
    dept_id: 3, 
    position: 'System Administrator', 
    hire_date: new Date('2020-01-15'), 
    status: 'Active' 
  },
  { 
    emp_id: 2, 
    acc_id: 2, 
    email: 'john.doe@example.com', 
    department: 'Marketing', 
    dept_id: 1, 
    position: 'Marketing Specialist', 
    hire_date: new Date('2021-03-10'), 
    status: 'Active' 
  },
  { 
    emp_id: 3, 
    acc_id: 3, 
    email: 'jane.smith@example.com', 
    department: 'HR', 
    dept_id: 2, 
    position: 'HR Manager', 
    hire_date: new Date('2019-11-05'), 
    status: 'Active' 
  },
  { 
    emp_id: 4, 
    acc_id: 4, 
    email: 'robert.johnson@example.com', 
    department: 'Finance', 
    dept_id: 4, 
    position: 'Financial Analyst', 
    hire_date: new Date('2022-01-20'), 
    status: 'Active' 
  },
  { 
    emp_id: 5, 
    acc_id: 5, 
    email: 'maria.garcia@example.com', 
    department: 'Marketing', 
    dept_id: 1, 
    position: 'Marketing Director', 
    hire_date: new Date('2018-06-15'), 
    status: 'Active' 
  }
];

const requests = [
  { 
    req_id: 1, 
    emp_id: 1, 
    type: 1, // Equipment 
    items: 'Laptop (x1), Monitor (x2)', 
    status: 4 // Awaiting Approval
  },
  { 
    req_id: 2, 
    emp_id: 2, 
    type: 2, // Leave 
    items: 'Vacation (5 days)', 
    status: 2 // Approved
  },
  { 
    req_id: 3, 
    emp_id: 3, 
    type: 3, // Training 
    items: 'HR Certification Course', 
    status: 1 // Pending
  },
  { 
    req_id: 4, 
    emp_id: 4, 
    type: 1, // Equipment 
    items: 'Financial Software License', 
    status: 5 // Completed
  },
  { 
    req_id: 5, 
    emp_id: 5, 
    type: 3, // Training 
    items: 'Leadership Workshop', 
    status: 3 // Rejected
  }
];

// Status history for tracking changes
const statusHistory = [
  { 
    history_id: 1, 
    req_id: 1, 
    old_status: 1, // Pending
    new_status: 4, // Awaiting Approval
    change_date: new Date('2023-05-10T14:30:00')
  },
  { 
    history_id: 2, 
    req_id: 2, 
    old_status: 1, // Pending
    new_status: 4, // Awaiting Approval
    change_date: new Date('2023-04-22T09:15:00')
  },
  { 
    history_id: 3, 
    req_id: 2, 
    old_status: 4, // Awaiting Approval
    new_status: 2, // Approved
    change_date: new Date('2023-04-23T11:45:00')
  }
];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Fake backend intercepted request:', request.url);
    const { url, method, headers, body } = request;

    return handleRoute();

    function handleRoute() {
      // Helper function to get URL path parameters
      const getUrlParams = (url: string) => {
        const urlParts = url.split('/');
        return urlParts[urlParts.length - 1];
      };

      // ACCOUNTS routes
      if (url.match(/\/api\/accounts$/i) && method === 'GET') {
        return getAccounts();
      }
      if (url.match(/\/api\/accounts\/\d+$/i) && method === 'GET') {
        const id = getUrlParams(url);
        return getAccountById(parseInt(id));
      }
      if (url.match(/\/api\/accounts$/i) && method === 'POST') {
        return createAccount();
      }

      // DEPARTMENTS routes
      if (url.match(/\/api\/departments$/i) && method === 'GET') {
        return getDepartments();
      }
      if (url.match(/\/api\/departments\/\d+$/i) && method === 'GET') {
        const id = getUrlParams(url);
        return getDepartmentById(parseInt(id));
      }
      if (url.match(/\/api\/departments$/i) && method === 'POST') {
        return createDepartment();
      }
      if (url.match(/\/api\/departments\/\d+$/i) && method === 'PUT') {
        const id = getUrlParams(url);
        return updateDepartment(parseInt(id));
      }

      // EMPLOYEES routes
      if (url.match(/\/api\/employees$/i) && method === 'GET') {
        return getEmployees();
      }
      if (url.match(/\/api\/employees\/\d+$/i) && method === 'GET') {
        const id = getUrlParams(url);
        return getEmployeeById(parseInt(id));
      }
      if (url.match(/\/api\/employees$/i) && method === 'POST') {
        return createEmployee();
      }
      if (url.match(/\/api\/employees\/\d+$/i) && method === 'PUT') {
        const id = getUrlParams(url);
        return updateEmployee(parseInt(id));
      }
      if (url.match(/\/api\/employees\/\d+$/i) && method === 'PATCH') {
        const id = getUrlParams(url);
        return transferEmployee(parseInt(id));
      }
      if (url.match(/\/api\/employees\/\d+$/i) && method === 'DELETE') {
        const id = getUrlParams(url);
        return deleteEmployee(parseInt(id));
      }

      // REQUESTS routes
      if (url.match(/\/api\/requests$/i) && method === 'GET') {
        return getRequests();
      }
      if (url.match(/\/api\/requests\/\d+$/i) && method === 'GET') {
        const id = getUrlParams(url);
        return getRequestById(parseInt(id));
      }
      if (url.match(/\/api\/requests$/i) && method === 'POST') {
        return createRequest();
      }
      if (url.match(/\/api\/requests\/\d+$/i) && method === 'PUT') {
        const id = getUrlParams(url);
        return updateRequest(parseInt(id));
      }
      if (url.match(/\/api\/requests\/\d+$/i) && method === 'PATCH') {
        const id = getUrlParams(url);
        return updateRequestStatus(parseInt(id));
      }

      // WORKFLOWS routes
      if (url.match(/\/api\/workflows$/i) && method === 'POST') {
        return createWorkflow();
      }
      if (url.match(/\/api\/workflows\/\d+$/i) && method === 'PATCH') {
        const id = getUrlParams(url);
        return updateWorkflowStatus(parseInt(id));
      }
      if (url.match(/\/api\/employees\/\d+\/workflows$/i) && method === 'GET') {
        const empId = url.split('/')[3]; // Extract emp_id from URL
        return getWorkflowsByEmployee(parseInt(empId));
      }

      // REQUEST APPROVAL routes
      if (url.match(/\/api\/request-approval\/set-awaiting-approval$/i) && method === 'POST') {
        return setRequestsAwaitingApproval();
      }
      if (url.match(/\/api\/request-approval\/status-counts$/i) && method === 'GET') {
        return getRequestStatusCounts();
      }

      // Pass through any requests not handled above
      return next.handle(request);
    }

    // ACCOUNTS handlers
    function getAccounts() {
      return ok(accounts.map(x => {
        // Create a new object without the password property
        const { password, ...accountWithoutPassword } = x;
        return accountWithoutPassword;
      }));
    }

    function getAccountById(id: number) {
      const account = accounts.find(x => x.acc_id === id);
      if (!account) return error('Account not found');
      
      // Create a new object without the password property
      const { password, ...accountWithoutPassword } = account;
      return ok(accountWithoutPassword);
    }

    function createAccount() {
      const account = body;
      account.acc_id = accounts.length ? Math.max(...accounts.map(x => x.acc_id)) + 1 : 1;
      accounts.push(account);
      return ok({ message: 'Account created successfully', id: account.acc_id });
    }

    // DEPARTMENTS handlers
    function getDepartments() {
      return ok(departments);
    }

    function getDepartmentById(id: number) {
      const department = departments.find(x => x.dept_id === id);
      return department ? ok(department) : error('Department not found');
    }

    function createDepartment() {
      const department = body;
      department.dept_id = departments.length ? Math.max(...departments.map(x => x.dept_id)) + 1 : 1;
      department.employeeCount = 0;
      departments.push(department);
      return ok({ message: 'Department added', id: department.dept_id });
    }

    function updateDepartment(id: number) {
      const department = departments.find(x => x.dept_id === id);
      if (!department) return error('Department not found');

      Object.assign(department, body);
      return ok({ message: 'Department updated successfully' });
    }

    // EMPLOYEES handlers
    function getEmployees() {
      return ok(employees);
    }

    function getEmployeeById(id: number) {
      const employee = employees.find(x => x.emp_id === id);
      return employee ? ok(employee) : error('Employee not found');
    }

    function createEmployee() {
      const employee = body;
      employee.emp_id = employees.length ? Math.max(...employees.map(x => x.emp_id)) + 1 : 1;
      
      // Increment department employee count
      const department = departments.find(x => x.dept_id === employee.dept_id);
      if (department) {
        department.employeeCount++;
      }

      employees.push(employee);
      return ok({ message: 'Employee added successfully', insertId: employee.emp_id });
    }

    function updateEmployee(id: number) {
      let employee = employees.find(x => x.emp_id === id);
      if (!employee) return error('Employee not found');
      
      console.log('Fake backend: Updating employee:', employee);
      console.log('Fake backend: With new data:', body);
      
      // Check if department changed
      if (employee.dept_id !== body.dept_id) {
        console.log(`Department change detected: ${employee.dept_id} -> ${body.dept_id}`);
        
        // Decrement old department count
        const oldDept = departments.find(x => x.dept_id === employee.dept_id);
        if (oldDept) {
          oldDept.employeeCount = Math.max(0, oldDept.employeeCount - 1);
          console.log(`Decremented old department (${oldDept.name}) count to ${oldDept.employeeCount}`);
        }
        
        // Increment new department count
        const newDept = departments.find(x => x.dept_id === body.dept_id);
        if (newDept) {
          newDept.employeeCount++;
          console.log(`Incremented new department (${newDept.name}) count to ${newDept.employeeCount}`);
          
          // Also update the department name in the employee record
          body.department = newDept.name;
        }
      }

      // Convert hire_date to Date object if it's a string
      if (body.hire_date && !(body.hire_date instanceof Date)) {
        body.hire_date = new Date(body.hire_date);
      }

      // Update employee properties
      Object.assign(employee, body);
      console.log('Fake backend: Employee after update:', employee);
      
      return ok({
        message: 'Employee updated successfully',
        employee: employee
      });
    }

    function transferEmployee(id: number) {
      let employee = employees.find(x => x.emp_id === id);
      if (!employee) return error('Employee not found');
      
      // Update department
      if (body.department) {
        // Only proceed if it's actually a different department
        if (employee.department === body.department) {
          return ok({
            message: 'Employee is already in this department',
            employee
          });
        }
        
        employee.department = body.department;
        
        // Update dept_id based on department name
        const dept = departments.find(d => d.name === body.department);
        if (dept) {
          // Get the old department first
          const oldDept = departments.find(d => d.dept_id === employee.dept_id);
          if (oldDept && oldDept.name !== body.department) {
            // Ensure count never goes below zero
            oldDept.employeeCount = Math.max(0, oldDept.employeeCount - 1);
          }
          
          // Update the employee's department ID
          employee.dept_id = dept.dept_id;
          
          // Increment new department count
          dept.employeeCount++;
        }
      }
      
      return ok({
        message: 'Employee transferred successfully',
        employee
      });
    }

    function deleteEmployee(id: number) {
      // Find employee
      const employee = employees.find(x => x.emp_id === id);
      if (!employee) return error('Employee not found');
      
      // Decrement department count
      const department = departments.find(x => x.dept_id === employee.dept_id);
      if (department) {
        department.employeeCount = Math.max(0, department.employeeCount - 1);
      }
      
      // Remove employee
      employees.splice(employees.findIndex(x => x.emp_id === id), 1);
      return ok({ message: 'Employee deleted successfully' });
    }

    // REQUESTS handlers
    function getRequests() {
      // Handle query params for filtering by emp_id
      if (url.includes('?emp_id=')) {
        const empId = parseInt(url.split('?emp_id=')[1]);
        return ok(requests.filter(req => req.emp_id === empId));
      }
      return ok(requests);
    }

    function getRequestById(id: number) {
      const request = requests.find(x => x.req_id === id);
      return request ? ok(request) : error('Request not found');
    }

    function createRequest() {
      const request = body;
      request.req_id = requests.length ? Math.max(...requests.map(x => x.req_id)) + 1 : 1;
      
      // Convert string status to number if needed
      if (typeof request.status === 'string') {
        const statusMap: Record<string, number> = {
          'Pending': 1,
          'Approved': 2,
          'Rejected': 3,
          'Awaiting Approval': 4,
          'Completed': 5
        };
        request.status = statusMap[request.status] || 1;
      }
      
      requests.push(request);
      
      // Add status history entry
      statusHistory.push({
        history_id: statusHistory.length ? Math.max(...statusHistory.map(x => x.history_id)) + 1 : 1,
        req_id: request.req_id,
        old_status: 0, // New
        new_status: request.status,
        change_date: new Date()
      });
      
      return ok({ message: 'Request created successfully', insertId: request.req_id });
    }

    function updateRequest(id: number) {
      const request = requests.find(x => x.req_id === id);
      if (!request) return error('Request not found');

      // Track old status for history
      const oldStatus = request.status;
      
      // Update request
      Object.assign(request, body);
      
      // Add history entry if status changed
      if (oldStatus !== request.status) {
        statusHistory.push({
          history_id: statusHistory.length ? Math.max(...statusHistory.map(x => x.history_id)) + 1 : 1,
          req_id: id,
          old_status: oldStatus,
          new_status: request.status,
          change_date: new Date()
        });
      }
      
      return ok({ message: 'Request updated successfully' });
    }

    function updateRequestStatus(id: number) {
      const request = requests.find(x => x.req_id === id);
      if (!request) return error('Request not found');

      // Map string status to number if needed
      let newStatus = body.status;
      if (typeof newStatus === 'string') {
        const statusMap: Record<string, number> = {
          'Pending': 1,
          'Approved': 2,
          'Rejected': 3,
          'Awaiting Approval': 4,
          'Completed': 5,
          'Cancelled': 3 // Maps to Rejected
        };
        newStatus = statusMap[newStatus] || 1;
      }
      
      // Track old status for history
      const oldStatus = request.status;
      
      // Update status
      request.status = newStatus;
      
      // Add history entry
      statusHistory.push({
        history_id: statusHistory.length ? Math.max(...statusHistory.map(x => x.history_id)) + 1 : 1,
        req_id: id,
        old_status: oldStatus,
        new_status: newStatus,
        change_date: new Date()
      });
      
      return ok({ message: 'Request status updated successfully' });
    }

    // WORKFLOWS handlers
    function createWorkflow() {
      // Workflows are stored as requests in our fake backend
      const workflow = body;
      
      // Map workflow fields to request fields
      const request = {
        req_id: requests.length ? Math.max(...requests.map(x => x.req_id)) + 1 : 1,
        emp_id: workflow.employeeId,
        type: mapWorkflowTypeToType(workflow.type),
        items: workflow.details,
        status: mapWorkflowStatusToStatus(workflow.status || 'Pending')
      };
      
      requests.push(request);
      
      // Return created workflow
      return ok({
        id: request.req_id,
        employeeId: workflow.employeeId,
        type: workflow.type,
        details: workflow.details,
        status: workflow.status || 'Pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    function updateWorkflowStatus(id: number) {
      const request = requests.find(x => x.req_id === id);
      if (!request) return error('Workflow not found');

      const oldStatus = request.status;
      const oldStatusText = mapStatusToWorkflowStatus(oldStatus);
      
      // Map workflow status to request status
      // First check if the status is already a number (direct request from workflow component)
      if (typeof body.status === 'number') {
        request.status = body.status;
      } else {
        request.status = mapWorkflowStatusToStatus(body.status);
      }
      
      // Add status history entry
      statusHistory.push({
        history_id: statusHistory.length ? Math.max(...statusHistory.map(x => x.history_id)) + 1 : 1,
        req_id: id,
        old_status: oldStatus,
        new_status: request.status,
        change_date: new Date()
      });
      
      // Determine message based on status
      let statusMessage = 'Workflow status updated successfully';
      let newStatusText = '';
      
      // Map the numeric status to display text
      if (request.status === 1) {
        newStatusText = 'Pending';
        statusMessage = 'Workflow has been reset to Pending status';
      } else if (request.status === 2) {
        newStatusText = 'Completed';
        statusMessage = 'Workflow has been marked as Completed';
      } else if (request.status === 3) {
        newStatusText = 'Cancelled';
        statusMessage = 'Workflow has been Cancelled';
      } else {
        newStatusText = mapStatusToWorkflowStatus(request.status);
      }
      
      return ok({
        message: statusMessage,
        oldStatus: oldStatusText,
        newStatus: newStatusText
      });
    }

    function getWorkflowsByEmployee(empId: number) {
      // Get all requests for this employee
      const employeeRequests = requests.filter(r => r.emp_id === empId);
      
      // Map to workflow format
      const workflows = employeeRequests.map(req => ({
        id: req.req_id,
        employeeId: req.emp_id,
        type: mapTypeToWorkflowType(req.type),
        details: req.items,
        status: mapStatusToWorkflowStatus(req.status),
        employee: employees.find(e => e.emp_id === req.emp_id)?.email || '',
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      return ok(workflows);
    }

    // REQUEST APPROVAL handlers
    function setRequestsAwaitingApproval() {
      let updatedCount = 0;
      
      // Update all pending requests to awaiting approval
      requests.forEach(req => {
        if (req.status === 1) { // Pending
          req.status = 4; // Awaiting Approval
          updatedCount++;
          
          // Add history entry
          statusHistory.push({
            history_id: statusHistory.length ? Math.max(...statusHistory.map(x => x.history_id)) + 1 : 1,
            req_id: req.req_id,
            old_status: 1, // Pending
            new_status: 4, // Awaiting Approval
            change_date: new Date()
          });
        }
      });
      
      return ok({
        message: 'Requests updated successfully',
        updatedCount
      });
    }

    function getRequestStatusCounts() {
      // Count requests by status
      const counts = [1, 2, 3, 4, 5].map(status => {
        const statusMap: Record<number, string> = {
          1: 'Pending',
          2: 'Approved',
          3: 'Rejected',
          4: 'Awaiting Approval',
          5: 'Completed'
        };
        return {
          status: statusMap[status] || `Unknown (${status})`,
          count: requests.filter(r => r.status === status).length
        };
      });
      
      return ok(counts);
    }

    // Helper functions for mapping types and statuses
    function mapTypeToWorkflowType(typeValue: number): string {
      const typeMap: Record<number, string> = {
        1: 'Equipment',
        2: 'Leave',
        3: 'Training'
      };
      return typeMap[typeValue] || 'Other';
    }

    function mapWorkflowTypeToType(workflowType: string): number {
      const typeMap: Record<string, number> = {
        'Equipment': 1,
        'Leave': 2,
        'Training': 3,
        'Onboarding': 1,  // Map to Equipment for now
        'Review': 3,      // Map to Training for now
        'Offboarding': 2  // Map to Leave for now
      };
      return typeMap[workflowType] || 1;
    }

    function mapStatusToWorkflowStatus(statusValue: number): string {
      const statusMap: Record<number, string> = {
        1: 'Pending',
        2: 'Approved',
        3: 'Rejected',
        4: 'Awaiting Approval',
        5: 'Completed'
      };
      return statusMap[statusValue] || 'Pending';
    }

    function mapWorkflowStatusToStatus(workflowStatus: string): number {
      const statusMap: Record<string, number> = {
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

    // Helper functions
    function ok(body?: any) {
      return of(new HttpResponse({ status: 200, body }))
        .pipe(delay(500)); // Add realistic delay
    }

    function error(message: string) {
      return throwError(() => ({ status: 404, error: { message } }))
        .pipe(
          materialize(),
          delay(500),
          dematerialize()
        ); // Add realistic delay
    }
  }
}

// Export the interceptor function for use with withInterceptors in Angular 16+
export function fakeBackendInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const { url, method, headers, body } = req;
  
  // Log the intercepted request
  console.log('Functional interceptor - Fake backend intercepted request:', req.url);

  // Handle route based on URL pattern
  return handleRoute();

  function handleRoute() {
    // Copy the implementation from the class interceptor
    // ... existing route handling code ...
    
    // Helper function to get URL path parameters
    const getUrlParams = (url: string) => {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1];
    };

    // ACCOUNTS routes
    if (url.match(/\/api\/accounts$/i) && method === 'GET') {
      return getAccounts();
    }
    if (url.match(/\/api\/accounts\/\d+$/i) && method === 'GET') {
      const id = getUrlParams(url);
      return getAccountById(parseInt(id));
    }
    if (url.match(/\/api\/accounts$/i) && method === 'POST') {
      return createAccount();
    }

    // DEPARTMENTS routes
    if (url.match(/\/api\/departments$/i) && method === 'GET') {
      return getDepartments();
    }
    if (url.match(/\/api\/departments\/\d+$/i) && method === 'GET') {
      const id = getUrlParams(url);
      return getDepartmentById(parseInt(id));
    }
    if (url.match(/\/api\/departments$/i) && method === 'POST') {
      return createDepartment();
    }
    if (url.match(/\/api\/departments\/\d+$/i) && method === 'PUT') {
      const id = getUrlParams(url);
      return updateDepartment(parseInt(id));
    }

    // EMPLOYEES routes
    if (url.match(/\/api\/employees$/i) && method === 'GET') {
      return getEmployees();
    }
    if (url.match(/\/api\/employees\/\d+$/i) && method === 'GET') {
      const id = getUrlParams(url);
      return getEmployeeById(parseInt(id));
    }
    if (url.match(/\/api\/employees$/i) && method === 'POST') {
      return createEmployee();
    }
    if (url.match(/\/api\/employees\/\d+$/i) && method === 'PUT') {
      const id = getUrlParams(url);
      return updateEmployee(parseInt(id));
    }
    if (url.match(/\/api\/employees\/\d+$/i) && method === 'PATCH') {
      const id = getUrlParams(url);
      return transferEmployee(parseInt(id));
    }
    if (url.match(/\/api\/employees\/\d+$/i) && method === 'DELETE') {
      const id = getUrlParams(url);
      return deleteEmployee(parseInt(id));
    }

    // Pass through any requests not handled above
    return next(req);
  }

  // Helper functions
  function getAccounts() {
    return ok(accounts);
  }

  function getAccountById(id: number) {
    const account = accounts.find(x => x.acc_id === id);
    return ok(account);
  }

  function createAccount() {
    const account = body;
    account.acc_id = accounts.length ? Math.max(...accounts.map(x => x.acc_id)) + 1 : 1;
    accounts.push(account);
    return ok(account);
  }

  function getDepartments() {
    return ok(departments);
  }

  function getDepartmentById(id: number) {
    const department = departments.find(x => x.dept_id === id);
    return ok(department);
  }

  function createDepartment() {
    const department = body;
    department.dept_id = departments.length ? Math.max(...departments.map(x => x.dept_id)) + 1 : 1;
    departments.push(department);
    return ok(department);
  }

  function updateDepartment(id: number) {
    let department = departments.find(x => x.dept_id === id);
    if (!department) return error('Department not found');
    
    // Update department properties
    Object.assign(department, body);
    return ok(department);
  }

  function getEmployees() {
    return ok(employees);
  }

  function getEmployeeById(id: number) {
    const employee = employees.find(x => x.emp_id === id);
    return ok(employee);
  }

  function createEmployee() {
    const employee = body;
    employee.emp_id = employees.length ? Math.max(...employees.map(x => x.emp_id)) + 1 : 1;
    
    // Ensure required properties are set
    if (!employee.status) employee.status = 'Active';
    if (!employee.hire_date) employee.hire_date = new Date();
    
    employees.push(employee);
    return ok(employee);
  }

  function updateEmployee(id: number) {
    let employee = employees.find(x => x.emp_id === id);
    if (!employee) return error('Employee not found');
    
    console.log('Fake backend: Updating employee:', employee);
    console.log('Fake backend: With new data:', body);
    
    // Check if department changed
    if (employee.dept_id !== body.dept_id) {
      console.log(`Department change detected: ${employee.dept_id} -> ${body.dept_id}`);
      
      // Decrement old department count
      const oldDept = departments.find(x => x.dept_id === employee.dept_id);
      if (oldDept) {
        oldDept.employeeCount = Math.max(0, oldDept.employeeCount - 1);
        console.log(`Decremented old department (${oldDept.name}) count to ${oldDept.employeeCount}`);
      }
      
      // Increment new department count
      const newDept = departments.find(x => x.dept_id === body.dept_id);
      if (newDept) {
        newDept.employeeCount++;
        console.log(`Incremented new department (${newDept.name}) count to ${newDept.employeeCount}`);
        
        // Also update the department name in the employee record
        body.department = newDept.name;
      }
    }

    // Convert hire_date to Date object if it's a string
    if (body.hire_date && !(body.hire_date instanceof Date)) {
      body.hire_date = new Date(body.hire_date);
    }

    // Update employee properties
    Object.assign(employee, body);
    console.log('Fake backend: Employee after update:', employee);
    
    return ok({
      message: 'Employee updated successfully',
      employee: employee
    });
  }

  function transferEmployee(id: number) {
    let employee = employees.find(x => x.emp_id === id);
    if (!employee) return error('Employee not found');
    
    // Update department
    if (body.department) {
      // Only proceed if it's actually a different department
      if (employee.department === body.department) {
        return ok({
          message: 'Employee is already in this department',
          employee
        });
      }
      
      employee.department = body.department;
      
      // Update dept_id based on department name
      const dept = departments.find(d => d.name === body.department);
      if (dept) {
        // Get the old department first
        const oldDept = departments.find(d => d.dept_id === employee.dept_id);
        if (oldDept && oldDept.name !== body.department) {
          // Ensure count never goes below zero
          oldDept.employeeCount = Math.max(0, oldDept.employeeCount - 1);
        }
        
        // Update the employee's department ID
        employee.dept_id = dept.dept_id;
        
        // Increment new department count
        dept.employeeCount++;
      }
    }
    
    return ok({
      message: 'Employee transferred successfully',
      employee
    });
  }

  function deleteEmployee(id: number) {
    // Remove employee from array
    const index = employees.findIndex(x => x.emp_id === id);
    if (index === -1) return error('Employee not found');
    
    const employee = employees[index];
    
    // Update department count if applicable
    if (employee.dept_id) {
      const dept = departments.find(d => d.dept_id === employee.dept_id);
      if (dept) {
        dept.employeeCount = Math.max(0, dept.employeeCount - 1);
      }
    }
    
    employees.splice(index, 1);
    return ok({ message: 'Employee deleted successfully' });
  }

  // Helper functions
  function ok(body?: any) {
    return of(new HttpResponse({ status: 200, body }))
      .pipe(delay(500)); // Add realistic delay
  }

  function error(message: string) {
    return throwError(() => ({ status: 404, error: { message } }))
      .pipe(
        materialize(),
        delay(500),
        dematerialize()
      ); // Add realistic delay
  }
}

export const fakeBackendProvider = {
  // Use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
}; 