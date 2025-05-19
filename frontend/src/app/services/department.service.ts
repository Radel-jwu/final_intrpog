import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department } from '../models/department.model';


@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private apiUrl = 'http://localhost:3000/api/departments'; // your Node.js backend

  constructor(private http: HttpClient) {}

  // Get all departments
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl);
  }
  getDepartmentById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/${id}`);
  }
  
  
  addDepartment(dept: Department): Observable<any> {
    return this.http.post(this.apiUrl, dept);
  }

  updateDepartment(id: number, department: Department): Observable<any> {
    return this.http.put(`http://localhost:3000/api/departments/${id}`, department);
  }
  
}
