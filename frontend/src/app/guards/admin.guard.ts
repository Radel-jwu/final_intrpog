import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return authService.currentUser.pipe(
    take(1),
    map(user => {
      // Check if user exists and has admin role
      const isAdmin = user?.role === 'admin';
      
      if (!isAdmin) {
        console.log('Access denied: Admin role required');
        router.navigate(['/']);
        return false;
      }
      
      return true;
    })
  );
}; 