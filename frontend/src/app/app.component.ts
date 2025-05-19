import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'INTPROG Final Project';
  isLoggedIn = false;
  isAdmin = false;
  currentUser: any = null;
  private authSubscription: Subscription | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Subscribe to auth state changes
    this.authSubscription = this.authService.currentUser.subscribe(user => {
      console.log("user", user);
      this.currentUser = user;
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'admin';
      let userId = this.currentUser?.id;
     
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem("id", userId);
      }
      console.log('Auth state changed:', { isLoggedIn: this.isLoggedIn, isAdmin: this.isAdmin });
    });
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  logout() {
    this.authService.logout();
  }
}
