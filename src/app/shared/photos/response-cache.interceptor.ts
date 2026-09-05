import {
  HttpEvent,
  HttpEventType,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, from, of, switchMap, tap, throwError } from 'rxjs';

import { isCacheableUrl } from './response-cache';
import { ResponseCacheStore } from './response-cache.store';

export function picsumCacheInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const url = request.urlWithParams;

  if (request.method !== 'GET' || !isCacheableUrl(url)) {
    return next(request);
  }

  const cache = inject(ResponseCacheStore);

  return from(cache.read(url)).pipe(
    switchMap(cached => {
      if (cached?.fresh) {
        return of({ type: HttpEventType.Sent } as HttpEvent<unknown>, cached.response);
      }

      return next(request).pipe(
        tap(event => {
          if (event instanceof HttpResponse) {
            void cache.write(url, event);
          }
        }),
        catchError(error => (cached ? of(cached.response) : throwError(() => error))),
      );
    }),
  );
}
