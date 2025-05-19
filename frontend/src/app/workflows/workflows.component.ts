import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkflowService } from '../services/workflow.service';

@Component({
  selector: 'app-workflows',
  templateUrl: './workflows.component.html',
  styleUrls: ['./workflows.component.css']
})
export class WorkflowsComponent implements OnInit {
  workflows: any[] = [];
  loading = false;
  error = '';

  constructor(
    private workflowService: WorkflowService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadWorkflows();
  }

  loadWorkflows(): void {
    this.loading = true;
    this.workflowService.getAllWorkflows().subscribe({
      next: (data) => {
        this.workflows = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load workflows';
        this.loading = false;
      }
    });
  }

  updateStatus(workflowId: number, newStatus: string): void {
    this.workflowService.updateWorkflowStatus(workflowId, newStatus).subscribe({
      next: () => {
        this.loadWorkflows();
      },
      error: (err) => {
        this.error = 'Failed to update workflow status';
      }
    });
  }

  createOnboardingWorkflow(empId: number): void {
    this.workflowService.createOnboardingWorkflow(empId).subscribe({
      next: () => {
        this.loadWorkflows();
      },
      error: (err) => {
        this.error = 'Failed to create onboarding workflow';
      }
    });
  }
} 