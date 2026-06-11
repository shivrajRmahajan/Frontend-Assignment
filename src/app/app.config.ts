import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // withComponentInputBinding binds route params + resolved data to component
    // inputs by name (the detail page's `detail` input comes from the resolver).
    provideRouter(routes, withComponentInputBinding()),
    // HttpClient for the mock REST source (dummyjson). withFetch uses the
    // modern fetch backend (smaller, SSR-friendly).
    provideHttpClient(withFetch()),
  ]
};
