import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Account } from '../../models/account.model';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-add-acc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-acc.component.html',
  styleUrls: ['./add-acc.component.scss']
})
export class AddAccComponent {
  id: number | null = null;

  errorMessage: string = '';

  account: Account = {
    title: '',
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    role: '',
    status: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService
  ) {}

  

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      this.id = idParam ? +idParam : null;

      if (this.id) {
        this.accountService.getAccountById(this.id.toString()).subscribe({
          next: (data) => {
            this.account = data;
          },
          error: (err) => {
            console.error('Failed to load account data:', err);
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.id) {
      this.accountService.updateAccount(this.id.toString(), this.account).subscribe({
        next: () => {
          alert('Account updated successfully');
          this.router.navigate(['/accounts']);
        },
        error: (err) => {
          console.error('Update failed:', err);
        }
      });
    } else {
      this.accountService.addAccount(this.account).subscribe({
        next: () => {
          alert('Account created successfully');
          this.router.navigate(['/accounts']);
        },
        error: (err) => {
          console.error('Create failed:', err);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/accounts']);
  }
}
