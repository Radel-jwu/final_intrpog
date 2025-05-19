import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models/department.model';

@Component({
  selector: 'app-add-dept',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-dept.component.html',
  styleUrls: ['./add-dept.component.scss']
})


export class AddDeptComponent {
  id?: number;
  errorMessage: string = '';

  department: Department = { name: '', description: '' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.id = +idParam;
        this.loadDepartment(this.id); // Call here
      }
    });
  }

  loadDepartment(id: number): void {
    this.departmentService.getDepartmentById(id).subscribe({
      next: (data) => {
        console.log('Fetched department:', data);
        this.department = data;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load department';
        console.error(err);
      }
    });
  }



 save(): void {
  if (this.id) {
    console.log('Updating department with id:', this.id, 'Data:', this.department);
    this.departmentService.updateDepartment(this.id, this.department).subscribe({
      next: (response) => {
        console.log('Update successful:', response);
        this.router.navigate(['/departments']);
      },
      error: (err) => {
        this.errorMessage = 'Failed to update department';
        console.error('Update error:', err);
      }
    });
  } else {
    console.log('Adding new department:', this.department);
    this.departmentService.addDepartment(this.department).subscribe({
      next: () => {
        console.log('Add successful');
        this.router.navigate(['/departments']);
      },
      error: (err) => {
        this.errorMessage = 'Error adding department.';
        console.error('Add error:', err);
      }
    });
  }
}

  cancel() {
    this.router.navigate(['departments']);
  }
}
