import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // Clone the request and add the authorization header if token exists
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    // Send the request with the auth header
    return next(authReq).pipe(
      catchError(error => {
        // Handle 401 Unauthorized responses
        if (error.status === 401) {
          // Clear local storage and redirect to login
          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
  
  // If no token, send the original request
  return next(req);
}; 