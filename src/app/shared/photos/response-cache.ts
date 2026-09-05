import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';

import { PICSUM_ORIGIN, parsePhoto, parsePhotoList } from './picsum';

export const CACHE_PREFIX = 'gallery-api-';
export const CACHE_VERSION = 'v1';
export const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const CACHED_AT_HEADER = 'x-cached-at';

const LIST_PATH = '/v2/list';
const INFO_PATH = /^\/id\/[^/]+\/info$/;
const SKIPPED_HEADERS = new Set(['content-length']);

export function isCacheableUrl(url: string): boolean {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  return (
    parsed.origin === PICSUM_ORIGIN &&
    (parsed.pathname === LIST_PATH || INFO_PATH.test(parsed.pathname))
  );
}

export function isStorableBody(url: string, body: unknown): boolean {
  if (!isCacheableUrl(url)) {
    return false;
  }

  const { pathname } = new URL(url);

  try {
    if (pathname === LIST_PATH) {
      parsePhotoList(body);
    } else {
      parsePhoto(body);
    }

    return true;
  } catch {
    return false;
  }
}

export function isTransportFailure(error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse)) {
    return true;
  }

  return error.status === 0 || error.status >= 500;
}

export function isFresh(cachedAt: number, now: number): boolean {
  return now - cachedAt < CACHE_TTL_MS;
}

export function readCachedAt(headers: Headers): number {
  const raw = headers.get(CACHED_AT_HEADER);

  return raw === null ? Number.NaN : Number(raw);
}

export function toCachedResponse(response: HttpResponse<unknown>, now: number): Response {
  const headers = new Headers();

  for (const name of response.headers.keys()) {
    if (SKIPPED_HEADERS.has(name.toLowerCase())) {
      continue;
    }

    const value = response.headers.get(name);

    if (value !== null) {
      headers.set(name, value);
    }
  }

  headers.set('content-type', 'application/json');
  headers.set(CACHED_AT_HEADER, String(now));

  return new Response(JSON.stringify(response.body), { status: 200, statusText: 'OK', headers });
}

export function toHttpResponse(
  body: unknown,
  headers: Headers,
  url: string,
): HttpResponse<unknown> {
  return new HttpResponse({
    body,
    headers: new HttpHeaders(Object.fromEntries(headers.entries())),
    status: 200,
    statusText: 'OK',
    url,
  });
}
