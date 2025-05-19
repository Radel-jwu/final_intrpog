import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

const API_URL = 'http://localhost:3000'; // Make sure this matches your backend URL

export interface User {
  id: string;
  email: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser: Observable<User | null> = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Initialize from localStorage
    this.initializeFromStorage();
  }

  private initializeFromStorage(): void {
    let storedUser = null;
    if (this.isBrowser) {
      try {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
          storedUser = JSON.parse(userStr);
          console.log('Loaded user from storage:', storedUser);
        }
      } catch (e) {
        console.error('Error parsing stored user:', e);
        // Clear invalid storage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    }
    
    if (storedUser) {
      this.currentUserSubject.next(storedUser);
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<any>(`${API_URL}/api/accounts/login`, { email, password })
      .pipe(
        map(response => {
          console.log('Login response:', response);
          
          // Store user details and token in local storage
          const user: User = {
            id: response.acc_id,
            email: response.email,
            role: response.role
          };
          
          if (this.isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('token', response.token);
            console.log('User saved to storage');
          }
          
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => new Error(error.error?.message || 'Login failed. Please try again.'));
        })
      );
  }

  logout(): void {
    console.log('Logging out');
    // Remove user from local storage
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
    
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const isAuth = !!this.currentUserValue;
    console.log('isAuthenticated check:', isAuth);
    return isAuth;
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('token');
    }
    return null;
  }
} 