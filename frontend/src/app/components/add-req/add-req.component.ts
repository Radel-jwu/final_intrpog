import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { RequestService } from '../../services/request.service';
import { Employee } from '../../models/employee.model';
import { ChangeDetectorRef } from '@angular/core';


interface RequestItem {
  name: string;
  quantity: number;
}

interface RequestForm {
  type: string;
  employeeId: number | string;
  items: RequestItem[];
  status: string;
}

@Component({
  selector: 'app-add-req',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-req.component.html',
  styleUrl: './add-req.component.scss'
})
export class AddReqComponent implements OnInit {
  employees: Employee[] = [];
  isLoading = true;
  error = '';
  isSaving = false;
  isEditMode = false;

  request: RequestForm = {
    type: 'Equipment',
    employeeId: '',
    items: [{ name: '', quantity: 1 }],
    status: 'Pending'
  };

  constructor(
    private cdr: ChangeDetectorRef,   
    private router: Router,
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private requestService: RequestService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadEmployees(() => {
      if (id) {
        this.isEditMode = true;
        this.loadRequestById(+id);
      } else {
        this.isLoading = false;  // no edit mode, just show form
      }
    });
  }

  loadEmployees(callback?: () => void) {
    this.employeeService.getEmployees().subscribe({
      next: (emps) => {
        this.employees = emps;
        if (!this.isEditMode && this.employees.length > 0) {
          this.request.employeeId = this.employees[0]?.emp_id ?? '';
        }
        if (callback) callback();
      },
      error: () => {
        this.error = 'Failed to load employees.';
        if (callback) callback();
      }
    });
  }

  loadRequestById(id: number) {
    this.isLoading = true;
    this.requestService.getRequestById(id).subscribe({
      next: (data) => {
        console.log('Fetched request data:', data);
  
        this.request.type = data.type;
        this.request.employeeId = data.emp_id;
  
        if (typeof data.items === 'string') {
          const itemsArray = data.items.split(',').map(itemStr => {
            const match = itemStr.trim().match(/^(.+?)\s*\(x(\d+)\)$/);
            if (match) {
              return {
                name: match[1].trim(),
                quantity: parseInt(match[2], 10)
              };
            } else {
              return { name: itemStr.trim(), quantity: 1 }; // fallback
            }
          });
          this.request.items = itemsArray;
        } else {
          this.request.items = data.items;
        }
  
        this.request.status = data.status ?? 'Pending';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load request.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
  


  loadSampleEmployees(): void {
    this.employees = [
      {
        emp_id: 1,
        acc_id: 1,
        email: 'user@example.com',
        dept_id: 1,
        department: 'IT',
        position: 'Developer',
        hire_date: new Date(),
        status: 'Active'
      },
      {
        emp_id: 2,
        acc_id: 2,
        email: 'admin@example.com',
        dept_id: 2,
        department: 'HR',
        position: 'Manager',
        hire_date: new Date(),
        status: 'Active'
      }
    ];

    const emp001 = this.employees.find(emp => String(emp.emp_id).toUpperCase() === 'EMP001' || emp.emp_id === 1);
    this.request.employeeId = (emp001?.emp_id ?? this.employees[0]?.emp_id) ?? '';
  }

  formatEmployeeId(id?: number | string): string {
    if (id === undefined) return 'Unknown';

    if (typeof id === 'string' && id.startsWith('EMP')) {
      return id.toUpperCase();
    }

    let numericId = id;
    if (typeof id === 'string' && id.toUpperCase().startsWith('EMP')) {
      numericId = id.substring(3);
    }

    return `EMP${String(numericId).padStart(3, '0')}`;
  }

  addItem(): void {
    this.request.items.push({ name: '', quantity: 1 });
  }

  removeItem(index: number): void {
    if (this.request.items.length > 1) {
      this.request.items.splice(index, 1);
    }
  }

  saveRequest(): void {
    if (!this.request.employeeId || !this.request.type || this.request.items.some(item => !item.name)) {
      this.error = 'Please fill out all required fields.';
      return;
    }

    this.isSaving = true;
    this.error = '';

    const formattedItems = this.requestService.formatRequestItems(this.request.items);

    const requestData = {
      emp_id: this.request.employeeId,
      type: this.request.type,
      items: formattedItems,
      status: 'Pending'
    };
    const workflowEntry = {
      emp_id: this.request.employeeId,
      type: 'Request Approval',
      details: `Request Type: ${this.request.type} - Items: ${this.request.items.map((i: any) => i.name).join(', ')}`,
      status: 'Pending'
    };
    this.requestService.createWorkflow(workflowEntry).subscribe({
      next: () => {
        console.log('Workflow entry added successfully');
      },
      error: (err) => {
        console.error('Error adding workflow entry:', err);
        this.error = 'Failed to add workflow entry.';
        this.isSaving = false;
      }
    });
    const requestIdParam = this.route.snapshot.paramMap.get('id');

    if (this.isEditMode && requestIdParam) {
      const id = Number(requestIdParam);
      this.requestService.updateRequest(id, requestData).subscribe({
        next: () => {
          alert('Request updated successfully!');
          this.router.navigate(['/requests']);
        },
        error: (err) => {
          console.error('Error updating request:', err);
          this.error = 'Failed to update request.';
          this.isSaving = false;
        }
      });
    } else {
      this.requestService.addRequest(requestData).subscribe({
        next: () => {
          alert('Request submitted successfully!');
          this.router.navigate(['/requests']);
        },
        error: (err) => {
          console.error('Error saving request:', err);
          this.error = 'Failed to save request.';
          this.isSaving = false;
        }
      });
    }
  }
  

  cancel(): void {
    this.router.navigate(['/requests']);
  }
}
