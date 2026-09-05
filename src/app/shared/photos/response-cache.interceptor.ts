import {
  HttpEvent,
  HttpEventType,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
  HttpSentEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, from, of, switchMap, tap, throwError } from 'rxjs';

import { isCacheableUrl, isStorableBody, isTransportFailure } from './response-cache';
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
        return of({ type: HttpEventType.Sent } satisfies HttpSentEvent, cached.response);
      }

      return next(request).pipe(
        tap(event => {
          if (event instanceof HttpResponse && isStorableBody(url, event.body)) {
            void cache.write(url, event);
          }
        }),
        catchError(error =>
          cached && isTransportFailure(error) ? of(cached.response) : throwError(() => error),
        ),
      );
    }),
  );
}
