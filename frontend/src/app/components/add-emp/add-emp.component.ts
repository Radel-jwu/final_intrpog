import { Component, OnInit } from '@angular/core';
import { Employee } from '../../models/employee.model';
import { Department } from '../../models/department.model';
import { Account } from '../../models/account.model';
import { EmployeeService } from '../../services/employee.service';
import { DepartmentService } from '../../services/department.service';
import { AccountService } from '../../services/account.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-emp',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './add-emp.component.html',
  styleUrls: ['./add-emp.component.scss'],
  providers: [EmployeeService, DepartmentService, AccountService]
})
export class AddEmpComponent implements OnInit {

  departments: Department[] = [];
  accounts: Account[] = [];
  isEditMode: boolean = false;
  employeeId: string | null = null;
  errorMessage: string = '';

  employee = {
    emp_id: '',
    email: '',
    department: '',
    acc_id: '',
    dept_id: '',
    position: '',
    hire_date: '',
    status: 'Active'
  };

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Load dependencies first
    this.loadDepartments();
    this.loadAccounts();
    
    // Check if we're in edit mode after a short delay to ensure dependencies are loaded
    setTimeout(() => {
      this.route.paramMap.subscribe(params => {
        this.employeeId = params.get('id');
        this.isEditMode = !!this.employeeId;
        
        if (this.isEditMode) {
          this.loadEmployeeData(this.employeeId!);
        } else {
          this.setNextEmployeeId();
        }
      });
    }, 300); // Small delay to allow dependencies to load
  }

  loadEmployeeData(id: string): void {
    this.employeeService.getEmployeeById(id).subscribe({
      next: (emp) => {
        console.log('Employee data loaded:', emp);
        
        // Format date for the date input
        let formattedDate = '';
        if (emp.hire_date) {
          try {
            // Handle different date formats that might come from the API
            const hireDate = emp.hire_date instanceof Date 
              ? emp.hire_date 
              : new Date(emp.hire_date);
            
            // Check if date is valid before formatting
            if (!isNaN(hireDate.getTime())) {
              formattedDate = hireDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
              console.log('Formatted hire date:', formattedDate);
            } else {
              console.warn('Invalid hire date:', emp.hire_date);
            }
          } catch (error) {
            console.error('Error formatting date:', error);
          }
        }
        
        this.employee = {
          emp_id: this.formatEmployeeId(emp.emp_id),
          email: emp.email || '',
          department: emp.department || '',
          acc_id: emp.acc_id?.toString() || '',
          dept_id: emp.dept_id?.toString() || '',
          position: emp.position || '',
          hire_date: formattedDate,
          status: emp.status || 'Active'
        };
        
        console.log('Employee model after mapping:', this.employee);
        
        // If account ID is available, fetch specific account details
        if (emp.acc_id) {
          this.fetchAccountDetails(emp.acc_id);
        }
        
        // Ensure departments and accounts are loaded before trying to select values
        this.ensureDependenciesLoaded(() => {
          // Pre-select the department
          if (emp.dept_id) {
            const department = this.departments.find(dept => dept.dept_id === Number(emp.dept_id));
            if (department) {
              console.log('Found department:', department);
              this.employee.dept_id = department.dept_id?.toString() || '';
              this.employee.department = department.name || '';
            }
          }
          
          // Pre-select the account
          if (emp.acc_id) {
            const account = this.accounts.find(acc => acc.acc_id === Number(emp.acc_id));
            if (account) {
              console.log('Found account:', account);
              this.employee.acc_id = account.acc_id?.toString() || '';
              this.employee.email = account.email || '';
            }
          }
        });
      },
      error: (err) => {
        console.error('Error loading employee data', err);
        this.errorMessage = 'Failed to load employee data. Please try again.';
      }
    });
  }

  fetchAccountDetails(accId: number): void {
    this.accountService.getAccountById(accId.toString()).subscribe({
      next: (account: Account) => {
        if (account) {
          // Update the email in our form model
          this.employee.email = account.email || '';
          
          // Mark this account as pre-selected in the dropdown
          this.employee.acc_id = account.acc_id?.toString() || '';
          
          console.log('Account details fetched:', account);
        }
      },
      error: (err: any) => {
        console.error('Error fetching account details:', err);
      }
    });
  }

  formatEmployeeId(id?: number | string): string {
    if (id === undefined) return '';
    
    // If the ID is already in EMP format, return it as is
    if (typeof id === 'string' && id.startsWith('EMP')) {
      return id.toUpperCase();
    }
    
    // Format as EMP001, EMP002, etc.
    return `EMP${String(id).padStart(3, '0')}`;
  }

  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe({
      next: (data) => {
        this.departments = data;
      },
      error: (err) => {
        console.error('Error loading departments', err);
        this.errorMessage = 'Failed to load departments. Please try again.';
      }
    });
  }

  loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
      },
      error: (err) => {
        console.error('Error loading accounts', err);
        this.errorMessage = 'Failed to load accounts. Please try again.';
      }
    });
  }

  setNextEmployeeId(): void {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        console.log('Employees from service:', employees);

        const ids = employees
          .map(emp => {
            const idStr = String(emp.emp_id);
            const numPart = parseInt(idStr.replace(/[^\d]/g, ''), 10);
            return isNaN(numPart) ? 0 : numPart;
          });

        const maxId = Math.max(0, ...ids);
        const nextId = maxId + 1;

        this.employee.emp_id = 'EMP' + nextId.toString().padStart(3, '0');
      },
      error: (error) => {
        console.error('Error fetching employees', error);
        this.errorMessage = 'Failed to generate employee ID. Please try again.';
      }
    });
  }

  onSave() {
    this.errorMessage = '';
    
    // Validate required fields
    if (!this.employee.acc_id) {
      this.errorMessage = 'Please select a valid account.';
      return;
    }
    if (!this.employee.dept_id) {
      this.errorMessage = 'Please select a valid department.';
      return;
    }
    if (!this.employee.position) {
      this.errorMessage = 'Position is required.';
      return;
    }
    if (!this.employee.hire_date) {
      this.errorMessage = 'Hire date is required.';
      return;
    }

    // Find the selected account and department objects
    const selectedAccount = this.accounts.find(acc => String(acc.acc_id) === this.employee.acc_id);
    const selectedDept = this.departments.find(dept => String(dept.dept_id) === this.employee.dept_id);
    
    if (!selectedAccount) {
      this.errorMessage = 'Please select a valid account.';
      return;
    }
    if (!selectedDept) {
      this.errorMessage = 'Please select a valid department.';
      return;
    }

    // Create the employee object to save
    const employeeToSave: Employee = {
      acc_id: Number(this.employee.acc_id),
      email: selectedAccount.email || '',
      position: this.employee.position,
      department: selectedDept.name || '',  // Use the department name from the selected department
      dept_id: Number(this.employee.dept_id),
      hire_date: new Date(this.employee.hire_date),
      status: this.employee.status
    };

    // Add emp_id if in edit mode
    if (this.isEditMode && this.employeeId) {
      // Handle both numeric and EMP prefix formats
      let empId: number;
      
      if (typeof this.employeeId === 'string' && this.employeeId.startsWith('EMP')) {
        empId = parseInt(this.employeeId.substring(3));
      } else {
        empId = parseInt(this.employeeId);
      }
      
      if (!isNaN(empId)) {
        employeeToSave.emp_id = empId;
        console.log(`Setting employee ID for update: ${empId}`);
      } else {
        console.error('Invalid employee ID format:', this.employeeId);
        this.errorMessage = 'Invalid employee ID format. Cannot update.';
        return;
      }
    }

    console.log('Saving employee:', employeeToSave);

    if (this.isEditMode && this.employeeId) {
      // For update, ensure we have the correct numeric ID format
      let updateId = this.employeeId;
      
      // If the ID starts with 'EMP', extract just the numeric part for the API
      if (typeof updateId === 'string' && updateId.startsWith('EMP')) {
        updateId = updateId.substring(3);
      }
      
      console.log(`Updating employee with ID: ${updateId}`);
      
      this.employeeService.updateEmployee(updateId, employeeToSave).subscribe({
        next: (res) => {
          console.log('Employee updated successfully:', res);
          
          // Force a fresh reload of the employees page to show the updated data
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/employees']);
          });
        },
        error: (err) => {
          console.error('Update error', err);
          this.errorMessage = 'Error updating employee. Please try again.';
        }
      });
    } else {
      this.employeeService.addEmployee(employeeToSave).subscribe({
        next: (res) => {
          console.log('Employee added successfully:', res);
          
          // Force a fresh reload of the employees page to show the new data
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/employees']);
          });
        },
        error: (err) => {
          console.error('Save error', err);
          this.errorMessage = 'Error saving employee. Please try again.';
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/employees']);
  }

  // Helper method to ensure dependencies are loaded before selecting values
  ensureDependenciesLoaded(callback: () => void): void {
    // Check if departments and accounts are loaded
    if (this.departments.length > 0 && this.accounts.length > 0) {
      callback();
      return;
    }
    
    // Wait for dependencies to load
    const interval = setInterval(() => {
      if (this.departments.length > 0 && this.accounts.length > 0) {
        clearInterval(interval);
        callback();
      }
    }, 100);
    
    // Set a timeout to prevent infinite waiting
    setTimeout(() => {
      clearInterval(interval);
      console.warn('Timeout waiting for dependencies to load');
      callback(); // Try anyway with whatever we have
    }, 3000);
  }
}
