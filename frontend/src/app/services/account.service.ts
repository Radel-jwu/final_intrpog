import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Account } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:3000/api/accounts'; 

  constructor(private http: HttpClient) {}
  
  // Get all accounts
  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(this.apiUrl);
  }

  // Get account by ID
  getAccountById(id: string): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/${id}`);
  }

  // Add new account
  addAccount(account: Account): Observable<any> {
    return this.http.post(this.apiUrl, account);
  }

  // Update existing account
  updateAccount(id: string, account: Account): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, account);
  }

  // Delete account
  deleteAccount(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
