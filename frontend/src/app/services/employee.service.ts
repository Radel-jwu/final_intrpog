import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:3000/api/employees'; // Replace with your actual backend URL

  constructor(private http: HttpClient) {}

  // Fetch all employees
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  // Add a new employee
  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  // Fetch by ID - handles both numeric IDs and EMP format
  getEmployeeById(id: string): Observable<Employee> {
    // Convert from EMP format if needed
    const numericId = this.extractNumericId(id);
    return this.http.get<Employee>(`${this.apiUrl}/${numericId}`);
  }

  // Update employee - handles both numeric IDs and EMP format
  updateEmployee(id: string, employee: Employee): Observable<Employee> {
    // Convert from EMP format if needed
    const numericId = this.extractNumericId(id);
    console.log(`Sending update request for employee ID: ${numericId}`, employee);
    return this.http.put<Employee>(`${this.apiUrl}/${numericId}`, employee);
  }

  // Transfer employee to a different department
  transferEmployee(id: string | number, department: string): Observable<any> {
    // Convert from EMP format if needed
    const numericId = this.extractNumericId(id);
    return this.http.patch(`${this.apiUrl}/${numericId}`, { department });
  }

  // Delete employee
  deleteEmployee(id: string): Observable<void> {
    // Convert from EMP format if needed
    const numericId = this.extractNumericId(id);
    return this.http.delete<void>(`${this.apiUrl}/${numericId}`);
  }

  // Helper method to extract numeric ID from string ID (e.g., "EMP001" -> "1")
  private extractNumericId(id: string | number): string {
    if (typeof id === 'number') {
      return id.toString();
    }
    
    if (typeof id === 'string') {
      // Check if the ID starts with 'EMP'
      if (id.startsWith('EMP')) {
        // Extract the numeric part and remove leading zeros
        return parseInt(id.substring(3)).toString();
      }
    }
    
    // If it's already a numeric string or doesn't match the pattern
    return id.toString();
  }
}
