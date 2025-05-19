import { Component, OnInit  } from '@angular/core';
import { AccountService} from '../../services/account.service';
import { Account } from '../../models/account.model';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';



@Component({
  selector: 'app-accounts',
  standalone: true, 
  imports: [CommonModule],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})


export class AccountsComponent implements OnInit {
  accounts: Account[] = [];

  id: number | null = null;


  constructor(
        private accountService: AccountService,
        private router: Router,

  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        console.log(this.accounts);
      },
      error: (err) => {
        console.error('Failed to fetch accounts', err);
      }
    });
  }
  add() {
    // Logic to add a new account
    console.log('Add account clicked');
     this.router.navigate(['add-acc']);
  }

   edit(id?: number) {
    if (!id) {
      console.error('No account ID provided for edit');
      return;
    }
    
    console.log('Editing account with ID:', id);
    this.router.navigate(['edit-acc', id]);
  }
  
}
