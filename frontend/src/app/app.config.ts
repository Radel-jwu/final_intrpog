import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { fakeBackendProvider } from './helpers/fake-backend';
import { authInterceptor } from './interceptors/auth.interceptor';

// Flag to toggle between real and fake backend
const USE_FAKE_BACKEND = false;

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideClientHydration(withEventReplay()),
    ...(USE_FAKE_BACKEND ? [fakeBackendProvider] : [])
  ]
};
