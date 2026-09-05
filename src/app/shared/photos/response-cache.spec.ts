import { HttpErrorResponse } from '@angular/common/http';

import { PAGE_SIZE, PICSUM_ORIGIN, photoInfoUrl, photoListUrl } from './picsum';
import { picsumDto, picsumPageHeaders } from './picsum.test-data';
import {
  CACHED_AT_HEADER,
  CACHE_NAME,
  CACHE_TTL_MS,
  isCacheableUrl,
  isFresh,
  isStorableBody,
  isTransportFailure,
  readCachedAt,
  toCachedResponse,
  toHttpResponse,
} from './response-cache';
import { apiResponse } from './response-cache.test-data';

describe('CACHE_NAME', () => {
  it('carries the version so a shape change can drop the previous generation', () => {
    expect(CACHE_NAME).toBe('gallery-api-v1');
  });
});

describe('isCacheableUrl', () => {
  it('accepts the list endpoint with its query string', () => {
    expect(isCacheableUrl(photoListUrl(2, PAGE_SIZE))).toBeTrue();
  });

  it('accepts the info endpoint', () => {
    expect(isCacheableUrl(photoInfoUrl('564'))).toBeTrue();
  });

  it('rejects an image url', () => {
    expect(isCacheableUrl(`${PICSUM_ORIGIN}/id/564/600/400`)).toBeFalse();
  });

  it('rejects another origin', () => {
    expect(isCacheableUrl('https://example.com/v2/list')).toBeFalse();
  });

  it('rejects a relative url', () => {
    expect(isCacheableUrl('/v2/list')).toBeFalse();
  });

  it('rejects a malformed url', () => {
    expect(isCacheableUrl('not a url')).toBeFalse();
  });
});

describe('isFresh', () => {
  it('accepts an entry younger than the ttl', () => {
    expect(isFresh(1000, 1000 + CACHE_TTL_MS - 1)).toBeTrue();
  });

  it('rejects an entry exactly at the ttl', () => {
    expect(isFresh(1000, 1000 + CACHE_TTL_MS)).toBeFalse();
  });

  it('rejects an entry with no timestamp', () => {
    expect(isFresh(Number.NaN, 1000)).toBeFalse();
  });
});

describe('isStorableBody', () => {
  it('accepts a valid list body', () => {
    expect(isStorableBody(photoListUrl(1, PAGE_SIZE), [picsumDto()])).toBeTrue();
  });

  it('accepts a valid info body', () => {
    expect(isStorableBody(photoInfoUrl('564'), picsumDto({ id: '564' }))).toBeTrue();
  });

  it('rejects a list body whose entries are missing a field the parser requires', () => {
    const malformed: Record<string, unknown> = { ...picsumDto() };

    delete malformed['download_url'];

    expect(isStorableBody(photoListUrl(1, PAGE_SIZE), [malformed])).toBeFalse();
  });

  it('rejects a list body that is not an array', () => {
    expect(isStorableBody(photoListUrl(1, PAGE_SIZE), picsumDto())).toBeFalse();
  });

  it('rejects a url that is not cacheable at all', () => {
    expect(isStorableBody('https://example.com/v2/list', [picsumDto()])).toBeFalse();
  });
});

describe('isTransportFailure', () => {
  it('treats a non-HttpErrorResponse as a transport failure', () => {
    expect(isTransportFailure(new Error('boom'))).toBeTrue();
  });

  it('treats status 0 as a transport failure', () => {
    expect(isTransportFailure(new HttpErrorResponse({ status: 0 }))).toBeTrue();
  });

  it('treats a 5xx status as a transport failure', () => {
    expect(isTransportFailure(new HttpErrorResponse({ status: 503 }))).toBeTrue();
  });

  it('does not treat a 4xx status as a transport failure', () => {
    expect(isTransportFailure(new HttpErrorResponse({ status: 404 }))).toBeFalse();
  });
});

describe('readCachedAt', () => {
  it('returns NaN when the header is missing', () => {
    expect(readCachedAt(new Headers())).toBeNaN();
  });
});

describe('cache entry conversion', () => {
  it('round trips the body, the link header and the timestamp', async () => {
    const body = [picsumDto()];
    const url = photoListUrl(1, PAGE_SIZE);
    const stored = toCachedResponse(apiResponse(body, picsumPageHeaders(2)), 1234);

    expect(readCachedAt(stored.headers)).toBe(1234);

    const restored = toHttpResponse(await stored.json(), stored.headers, url);

    expect(restored.body).toEqual(body);
    expect(restored.headers.get('link')).toBe(picsumPageHeaders(2)['Link']);
    expect(restored.headers.get(CACHED_AT_HEADER)).toBe('1234');
    expect(restored.status).toBe(200);
    expect(restored.url).toBe(url);
  });

  it('does not copy content-length, since it describes the network body, not the restored one', () => {
    const stored = toCachedResponse(
      apiResponse([picsumDto()], { ...picsumPageHeaders(2), 'content-length': '42' }),
      1234,
    );

    expect(stored.headers.get('link')).toBe(picsumPageHeaders(2)['Link']);
    expect(stored.headers.has('content-length')).toBeFalse();
  });
});
