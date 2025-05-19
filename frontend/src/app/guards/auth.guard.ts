import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return authService.currentUser.pipe(
    take(1),
    map(user => {
      // Check if user is logged in
      const isLoggedIn = !!user;
      
      if (!isLoggedIn) {
        console.log('Access denied: Login required');
        // Store the attempted URL for redirecting after login
        const returnUrl = state.url;
        router.navigate(['/login'], { queryParams: { returnUrl } });
        return false;
      }
      
      return true;
    })
  );
}; 