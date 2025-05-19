import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface Workflow {
  id?: number;
  employeeId: string | number;
  type: string;
  details: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private apiUrl = `${environment.apiUrl}/workflows`;

  constructor(private http: HttpClient) {}

  getAllWorkflows(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getEmployeeWorkflows(empId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/employee/${empId}`);
  }

  createWorkflow(workflow: any): Observable<any> {
    return this.http.post(this.apiUrl, workflow);
  }

  updateWorkflowStatus(workflowId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${workflowId}/status`, { status });
  }

  createOnboardingWorkflow(empId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding`, { emp_id: empId });
  }

  // Add other workflow-related methods as needed
}
