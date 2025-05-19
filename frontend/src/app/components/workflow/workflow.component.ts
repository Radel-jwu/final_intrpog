import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

interface Workflow {
  id: number;
  employeeId: string | number;
  type: string;
  details: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-workflow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workflow.component.html',
  styleUrl: './workflow.component.scss'
})
export class WorkflowComponent implements OnInit {
  employeeId: string = '';
  formattedEmployeeId: string = '';
  workflows: Workflow[] = [];
  showAddModal: boolean = false;
  isLoading: boolean = true;
  error: string | null = null;
  statusMessage: string | null = null;
  statusSuccess: boolean = true;
  
  // New department transfer fields
  sourceDepartment: string = '';
  targetDepartment: string = '';
  
  newWorkflow: Partial<Workflow> = {
    type: '',
    details: '',
    status: 'Pending'
  };

  departmentOptions = ['Marketing', 'HR', 'IT', 'Finance', 'Operations', 'Engineering', 'Sales'];

  private apiUrl = 'http://localhost:3000/api/workflows/';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // console.log('Workflow component initialized');
    // let id = localStorage.getItem("id");
    // if(id != null){
    //   this.employeeId = id;
    //   this.formattedEmployeeId = this.formatEmployeeId(this.employeeId);
    //   console.log('Employee ID set:', this.employeeId, 'Formatted as:', this.formattedEmployeeId);
    //   this.loadWorkflows();
    // }else {
    //   console.error('No employee ID provided in route');
    //   this.error = 'No employee ID provided';
    //   this.isLoading = false;
    // }
    // Get employee ID from route params
    this.route.params.subscribe(params => {
      if (params['id']) {
        // existing: load only that employee’s workflows
        this.employeeId = params['id'];
        this.formattedEmployeeId = this.formatEmployeeId(this.employeeId);
        this.loadWorkflows();
      } else {
        // NEW: no `id` in URL → show entire table 
        this.formattedEmployeeId = 'All';
        this.loadWorkflows();
      }
    });
  }

  /**
   * Formats an employee ID number as EMP001, EMP002, etc.
   */
  formatEmployeeId(id?: number | string): string {
    if (id === undefined) return 'Unknown';
    
    // If the ID is already in EMP format, return it as is
    if (typeof id === 'string' && id.startsWith('EMP')) {
      return id.toUpperCase();
    }
    
    // Convert to string and extract numeric part if it starts with EMP
    let numericId = id;
    if (typeof id === 'string' && id.toUpperCase().startsWith('EMP')) {
      numericId = id.substring(3);
    }
    
    // Format as EMP001, EMP002, etc.
    return `EMP${String(numericId).padStart(3, '0')}`;
  }

  loadWorkflows(): void {
  this.isLoading = true;
  this.error = null;

  let url = this.apiUrl;
  if (this.employeeId) {
    url += `${this.employeeId}`;
  }

  this.http.get<Workflow[]>(url).subscribe({
    next: (data) => {
      console.log('Workflows loaded:', data);
      this.workflows = data;
      this.isLoading = false;
    },
    error: (err: HttpErrorResponse) => {
      console.error('Error loading workflows:', err);
      this.workflows = []; // Ensure workflows is an empty array on error
      this.error = 'Failed to load workflows.';
      this.isLoading = false;
      
    }
  });
}

  loadSampleData(): void {
    console.log('Loading sample data for employee:', this.employeeId);
    // Sample data for demonstration
    this.workflows = [
      {
        id: 1,
        employeeId: this.employeeId,
        type: 'Department Transfer',
        details: 'Employee transferred from Engineering to Marketing',
        status: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        employeeId: this.employeeId,
        type: 'Equipment',
        details: 'Laptop (x1)',
        status: 'Awaiting Approval',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        employeeId: this.employeeId,
        type: 'Leave',
        details: 'Vacation (x5)',
        status: 'Approved',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        employeeId: this.employeeId,
        type: 'Training',
        details: 'Security Training',
        status: 'Rejected',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  updateWorkflowStatus(workflowId: number, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedStatus = target.value;
  
    if (!selectedStatus) return;
  
    console.log(`Updating workflow ${workflowId} status to ${selectedStatus}`);
  
    const workflow = this.workflows.find(w => w.id === workflowId);
    if (workflow) {
      const previousStatus = workflow.status;
  
      this.setStatusMessage(`Updating workflow status to ${selectedStatus}...`, true);
  
      workflow.status = selectedStatus;
      workflow.updatedAt = new Date();
  
      this.http.patch(`${this.apiUrl}/workflows/${workflowId}`, { status: selectedStatus })
        .subscribe({
          next: (response) => {
            console.log('Workflow status updated successfully:', response);
            this.setStatusMessage(`Workflow status updated to ${selectedStatus} successfully!`, true);
  
            if (previousStatus !== selectedStatus) {
              this.logStatusChange(workflowId, previousStatus, selectedStatus);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error updating workflow:', err);
  
            if (err.status === 404) {
              console.log('Attempting fallback to direct request update...');
              this.setStatusMessage('Trying alternative update method...', true);
  
              this.http.patch(`${this.apiUrl}/requests/${workflowId}`, { status: selectedStatus })
                .subscribe({
                  next: (response) => {
                    console.log('Request status updated via fallback:', response);
                    this.setStatusMessage(`Workflow status updated to ${selectedStatus} successfully!`, true);
                  },
                  error: (fallbackErr) => {
                    console.error('Fallback update also failed:', fallbackErr);
                    workflow.status = previousStatus;
                    this.setStatusMessage(`Failed to update status: ${fallbackErr.message || 'Server error'}`, false);
                  }
                });
            } else {
              workflow.status = previousStatus;
              this.setStatusMessage(`Failed to update status: ${err.message || 'Server error'}`, false);
            }
          }
        });
    }
  
    target.value = '';
  }
  
  setStatusMessage(message: string, isSuccess: boolean): void {
    this.statusMessage = message;
    this.statusSuccess = isSuccess;
    
    // Auto-clear success messages after 5 seconds
    if (isSuccess) {
      setTimeout(() => {
        if (this.statusMessage === message) {
          this.clearStatusMessage();
        }
      }, 5000);
    }
  }
  
  clearStatusMessage(): void {
    this.statusMessage = null;
  }
  
  // Log status changes for auditing purposes
  private logStatusChange(workflowId: number, oldStatus: string, newStatus: string): void {
    console.log(`Status change logged: Workflow #${workflowId} changed from ${oldStatus} to ${newStatus}`);
    
    // Here you would normally send a request to create a log entry in the database
    // For demo purposes, we're just logging to console
  }

  navigateBack(): void {
    console.log('Navigating back to employees');
    this.router.navigate(['/employees']);
  }

  openAddWorkflowModal(): void {
    this.resetForm();
    this.showAddModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
  }

  resetForm(): void {
    this.newWorkflow = {
      type: '',
      details: '',
      status: 'Pending'
    };
    this.sourceDepartment = '';
    this.targetDepartment = '';
  }

  addWorkflow(): void {
    // For department transfers, build the details from the source and target departments
    if (this.newWorkflow.type === 'Department Transfer') {
      if (!this.sourceDepartment || !this.targetDepartment) {
        alert('Please select both source and target departments');
        return;
      }
      
      // Format the details in the expected format
      console.log('Source Department:', this.sourceDepartment);
      console.log('Target Department:', this.targetDepartment);
      this.newWorkflow.details = `Employee transferred from ${this.sourceDepartment} to ${this.targetDepartment}`;
    } else if (!this.newWorkflow.details) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Adding new workflow:', this.newWorkflow);
    
    const workflow: Partial<Workflow> = {
      ...this.newWorkflow,
      employeeId: this.employeeId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Special handling for department transfers
    if (workflow.type === 'Department Transfer') {
      // Here we would normally trigger a department transfer in a real backend
      console.log('Processing department transfer:', workflow.details);
      
      // In a real app, we would update the employee department here by calling the API
      this.updateEmployeeDepartment(this.targetDepartment);
    }

    // Add to server
    this.http.post<Workflow>(`${this.apiUrl}/workflows`, workflow)
      .subscribe({
        next: (createdWorkflow) => {
          console.log('Workflow created successfully:', createdWorkflow);
          this.workflows.push(createdWorkflow);
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating workflow:', err);
          // For demo, create a mock response with ID
          const mockResponse: Workflow = {
            id: Math.floor(Math.random() * 1000),
            employeeId: this.employeeId,
            type: workflow.type || '',
            details: workflow.details || '',
            status: 'Pending',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          this.workflows.push(mockResponse);
          this.closeModal();
        }
      });
  }
  getDepartmentTransfers(): Workflow[] {
    return this.workflows.filter(w => w.type === 'Department Transfer');
  }
  
  getRegularWorkflows(): Workflow[] {
    return this.workflows.filter(w => w.type !== 'Department Transfer');
  }
  
  private updateEmployeeDepartment(newDepartment: string): void {
    // Call the employee PATCH endpoint to update the department
    this.http.patch(`${this.apiUrl}/employees/${this.employeeId}`, { department: newDepartment })
      .subscribe({
        next: (response) => {
          console.log('Employee department updated:', response);
        },
        error: (err) => {
          console.error('Error updating employee department:', err);
        }
      });
  }
}

