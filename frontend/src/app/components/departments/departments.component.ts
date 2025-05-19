import { Component, OnInit } from '@angular/core';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models/department.model';

import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: '',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss']
})
export class DepartmentsComponent implements OnInit {
  departments: Department[] = [];

  constructor(
    private departmentService: DepartmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.departmentService.getDepartments().subscribe({
      next: (data) => this.departments = data,
      error: (err) => console.error('Error loading departments:', err)
    });
  }

  account() {
    return { role: 'Admin' };
  }

 edit(id?: number) {
  if (!id) {
    console.error('Invalid department id');
    return;
  }
  this.router.navigate(['/edit-dept', id]);
}

  add() {
    
    this.router.navigate(['/add-dept']);
  }
}
