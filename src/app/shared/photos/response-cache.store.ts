import { HttpResponse } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';

import {
  CACHE_NAME,
  CACHE_PREFIX,
  isFresh,
  readCachedAt,
  toCachedResponse,
  toHttpResponse,
} from './response-cache';

export const RESPONSE_CACHE_STORAGE = new InjectionToken<CacheStorage | null>(
  'ResponseCacheStorage',
  { providedIn: 'root', factory: () => (typeof caches === 'undefined' ? null : caches) },
);

export interface CachedResponse {
  readonly response: HttpResponse<unknown>;
  readonly fresh: boolean;
}

@Injectable({ providedIn: 'root' })
export class ResponseCacheStore {
  private readonly storage = inject(RESPONSE_CACHE_STORAGE);

  constructor() {
    void this.purgeOtherVersions();
  }

  private async purgeOtherVersions(): Promise<void> {
    try {
      const names = (await this.storage?.keys()) ?? [];
      const previous = names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME);

      await Promise.all(previous.map(name => this.storage?.delete(name)));
    } catch {
      return;
    }
  }

  async read(url: string): Promise<CachedResponse | null> {
    try {
      const cache = await this.storage?.open(CACHE_NAME);
      const cached = await cache?.match(url);

      if (!cached) {
        return null;
      }

      const body: unknown = await cached.json();

      return {
        response: toHttpResponse(body, cached.headers, url),
        fresh: isFresh(readCachedAt(cached.headers), Date.now()),
      };
    } catch {
      return null;
    }
  }

  async write(url: string, response: HttpResponse<unknown>): Promise<void> {
    if (response.status !== 200) {
      return;
    }

    try {
      const cache = await this.storage?.open(CACHE_NAME);
      await cache?.put(url, toCachedResponse(response, Date.now()));
    } catch {
      return;
    }
  }
}
