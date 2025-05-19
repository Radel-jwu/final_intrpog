import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { fakeBackendProvider } from './helpers/fake-backend';
import { authInterceptor } from './interceptors/auth.interceptor';

// Flag to toggle between real and fake backend
const USE_FAKE_BACKEND = false;

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    ...(USE_FAKE_BACKEND ? [fakeBackendProvider] : [])
  ]
};
