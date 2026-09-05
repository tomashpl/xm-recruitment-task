import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideGalleryUi } from '@gallery/ui';

import { routes } from './app.routes';
import { picsumCacheInterceptor } from './shared/photos/response-cache.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch(), withInterceptors([picsumCacheInterceptor])),
    provideRouter(routes, withComponentInputBinding()),
    provideGalleryUi(),
  ],
};
