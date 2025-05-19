import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Request {
  id?: number;
  emp_id: number | string;
  type: string;
  employee?: string;
  items: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = 'http://localhost:3000/api/requests';

  constructor(private http: HttpClient) {}

  // Get all requests
  getRequests(): Observable<Request[]> {
    return this.http.get<Request[]>(this.apiUrl);
  }

  // Get requests for a specific employee
  getRequestsByEmployee(empId: number | string): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.apiUrl}?emp_id=${empId}`);
  }

  // Get request by ID
  getRequestById(id: number): Observable<Request> {
    return this.http.get<Request>(`${this.apiUrl}/${id}`);
  }
  

  // Create new request
  addRequest(request: Request): Observable<Request> {
    return this.http.post<Request>(this.apiUrl, request);
  }

  // Update request
  updateRequest(id: number, request: Partial<Request>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, request);
  }

  // Update request status
  updateStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { status });
  }

  // Delete request
  deleteRequest(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
   createWorkflow(data: any) {
    return this.http.post('http://localhost:3000/api/workflows/addRequests', data);
  }

  // Helper method to format items for display
  formatRequestItems(items: Array<{name: string, quantity: number}>): string {
    return items.map(item => `${item.name} (x${item.quantity})`).join(', ');
  }
  
} 