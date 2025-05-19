import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);
  
  // Get token from localStorage only in browser environment
  const token = isBrowser ? localStorage.getItem('token') : null;
  
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
          // Clear local storage and redirect to login only in browser
          if (isBrowser) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('token');
            router.navigate(['/login']);
          }
        }
        return throwError(() => error);
      })
    );
  }
  
  // If no token, send the original request
  return next(req);
}; 