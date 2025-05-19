import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Workflow } from '../../models/workflow.model';
import { WorkflowService } from '../../services/workflow.service';


interface Department {
  dept_id: number;
  name: string;
}

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent implements OnInit {


  constructor(
    private router: Router,
    private employeeService: EmployeeService,
    private http: HttpClient,
    private workflowService: WorkflowService
  ) {}
    
  employees: Employee[] = [];
  departments: Department[] = [];
  showTransferModal: boolean = false;
  selectedEmployeeId: string = '';
  newDepartment: string = '';
  
  ngOnInit(): void {
    this.loadEmployees();
    this.fetchDepartments();
  }

  loadEmployees(): void {
    console.log('Loading employees...');
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        console.log('Employees data received:', data);
        this.employees = data.map(emp => {
          // Convert date strings to Date objects
          let hireDate: Date;
          try {
            // If hire_date is a string, convert it to a Date object
            hireDate = typeof emp.hire_date === 'string' 
              ? new Date(emp.hire_date) 
              : (emp.hire_date instanceof Date ? emp.hire_date : new Date());
          } catch (error) {
            console.error('Error parsing date:', error);
            hireDate = new Date(); // Fallback to current date
          }
          
          return {
            ...emp,
            hire_date: hireDate,
            status: emp.status || 'Unknown'
          };
        });
        console.log('Processed employees:', this.employees);
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
      }
    });
  }

  fetchDepartments(): void {
    this.http.get<Department[]>('http://localhost:3000/api/departments').subscribe({
      next: (data) => {
        this.departments = data;
      },
      error: (err) => {
        console.error('Error fetching departments:', err);
        // Fallback departments if API fails
        this.departments = [
          { dept_id: 1, name: 'Marketing' },
          { dept_id: 2, name: 'HR' },
          { dept_id: 3, name: 'IT' },
          { dept_id: 4, name: 'Finance' },
          { dept_id: 5, name: 'Operations' }
        ];
      }
    });
  }

  formatEmployeeId(id?: number): string {
    if (!id) return 'Unknown';
    return `EMP${String(id).padStart(3, '0')}`;
  }
  
  // Other methods in your component...

  // Temporary account role for demo
  account() {
    return { role: 'Admin' };
  }

  add(): void {
    this.router.navigate(['/add-emp']);
  }
  
  edit(id: number): void {
    this.router.navigate(['/edit-emp', this.formatEmployeeId(id)]);
  }
  
  transfer(id: number): void {
    this.selectedEmployeeId = this.formatEmployeeId(id);
    this.showTransferModal = true;
  }
  
  request(): void {
    this.router.navigate(['/requests']);
  }
  
  workflow(id: number): void {
    this.router.navigate(['/workflows', id]);
  }
  
  closeTransferModal(): void {
    this.showTransferModal = false;
    this.newDepartment = '';
  }
  
 confirmTransfer(): void {
  if (!this.newDepartment) {
    alert('Please select a department.');
    return;
  }

  let empId = this.selectedEmployeeId;
  if (empId.startsWith('EMP')) {
    empId = empId.substring(3);
  }

    console.log('Attempting to transfer to:', this.newDepartment);
    const newDepartment = this.newDepartment;

  this.employeeService.transferEmployee(empId, this.newDepartment).subscribe({
    next: (res) => {
      console.log('Employee transferred successfully:', res);
      this.closeTransferModal();
      this.loadEmployees();

      // Create a new workflow entry for the department transfer
      const transferWorkflow: Workflow = {
        employeeId: empId,
        type: 'Department Transfer',
        details: `Employee transferred from ${res.previousDepartment} to ${newDepartment}`,
        status: 'Pending'
      };
      console.log('Previous:', res.previousDepartment, 'New:', this.newDepartment);
      console.log('Transfer workflow:', transferWorkflow);

      // Use the workflowService to create workflow
      this.workflowService.createWorkflow(transferWorkflow).subscribe({
        next: (createdWorkflow) => {
          console.log('Transfer workflow recorded:', createdWorkflow);
        },
        error: (err) => {
          console.error('Error recording transfer workflow:', err);
        }
      });
    },
    error: (err) => {
      console.error('Transfer error:', err);
      alert('Error transferring employee. Please try again.');
    }
  });
}
onDepartmentChange(): void {
  console.log('New department selected:', this.newDepartment);
}



}
