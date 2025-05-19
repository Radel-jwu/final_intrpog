import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService, Request } from '../services/request.service';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.scss'
})
export class RequestsComponent implements OnInit {
  requests: Request[] = [];
  isLoading = true;
  error = '';

  constructor(
    private router: Router,
    private requestService: RequestService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.requestService.getRequests().subscribe({
      next: (data) => {
        this.requests = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading requests:', err);
        this.error = 'Failed to load requests. Please try again.';
        this.isLoading = false;
        this.loadSampleRequests(); // Fallback to sample data if API fails
      }
    });
  }

  loadSampleRequests(): void {
    // Sample data for demonstration
    this.requests = [
      {
        id: 1,
        emp_id: 1,
        type: 'Equipment',
        employee: 'user@example.com',
        items: 'Laptop (x1)',
        status: 'Pending'
      },
      {
        id: 2,
        emp_id: 2,
        type: 'Leave',
        employee: 'admin@example.com',
        items: 'Vacation (x5)',
        status: 'Approved'
      },
      {
        id: 3,
        emp_id: 2,
        type: 'Equipment',
        employee: 'admin@example.com',
        items: 'Ranidel (x10)',
        status: 'Pending'
      }
    ];
  }

  addRequest(): void {
    console.log('Add request clicked');
    this.router.navigate(['/add-req']);
  }

  editRequest(id: number): void {
    console.log(`Edit request clicked for ID: ${id}`);
    this.router.navigate(['/edit-req', id]);
  }

  updateRequestStatus(id: number, status: string): void {
    this.requestService.updateStatus(id, status).subscribe({
      next: () => {
        // Update local data
        const request = this.requests.find(r => r.id === id);
        if (request) {
          request.status = status;
        }
        console.log(`Request ${id} status updated to ${status}`);
      },
      error: (err) => {
        console.error('Error updating request status:', err);
        this.error = 'Failed to update request status. Please try again.';
      }
    });
  }
}
