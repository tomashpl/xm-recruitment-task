import { HttpResponse } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { PAGE_SIZE, photoListUrl } from './picsum';
import { picsumDto, picsumPageHeaders } from './picsum.test-data';
import { CACHE_NAME, CACHE_TTL_MS } from './response-cache';
import { RESPONSE_CACHE_STORAGE, ResponseCacheStore } from './response-cache.store';
import { apiResponse, fakeCacheStorage, settle } from './response-cache.test-data';

describe('ResponseCacheStore', () => {
  const url = photoListUrl(1, PAGE_SIZE);
  let storage: CacheStorage;

  const store = (): ResponseCacheStore => TestBed.inject(ResponseCacheStore);

  beforeEach(() => {
    storage = fakeCacheStorage();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: RESPONSE_CACHE_STORAGE, useValue: storage },
      ],
    });
  });

  it('returns null when nothing is stored', async () => {
    expect(await store().read(url)).toBeNull();
  });

  it('round trips the body and the link header', async () => {
    const body = [picsumDto()];
    await store().write(url, apiResponse(body, picsumPageHeaders(2)));

    const cached = await store().read(url);

    expect(cached).not.toBeNull();
    expect(cached!.response.body).toEqual(body);
    expect(cached!.response.headers.get('link')).toBe(picsumPageHeaders(2)['Link']);
    expect(cached!.fresh).toBeTrue();
  });

  it('can read the same entry more than once', async () => {
    await store().write(url, apiResponse([picsumDto()]));

    expect(await store().read(url)).not.toBeNull();
    expect(await store().read(url)).not.toBeNull();
  });

  it('reports an entry older than the ttl as stale and still returns it', async () => {
    let clock = 1_000_000;
    spyOn(Date, 'now').and.callFake(() => clock);

    await store().write(url, apiResponse([picsumDto()]));
    clock += CACHE_TTL_MS;

    const cached = await store().read(url);

    expect(cached).not.toBeNull();
    expect(cached!.fresh).toBeFalse();
  });

  it('replaces an expired entry with the next successful response', async () => {
    let clock = 1_000_000;
    spyOn(Date, 'now').and.callFake(() => clock);

    await store().write(url, apiResponse([picsumDto({ id: '1' })]));
    clock += CACHE_TTL_MS;
    await store().write(url, apiResponse([picsumDto({ id: '2' })]));

    const cached = await store().read(url);

    expect(cached!.fresh).toBeTrue();
    expect(cached!.response.body).toEqual([picsumDto({ id: '2' })]);
  });

  it('ignores a response that is not a 200', async () => {
    await store().write(
      url,
      new HttpResponse({ body: null, status: 204, statusText: 'No Content' }),
    );

    expect(await store().read(url)).toBeNull();
  });

  it('drops a cache left by an earlier version', async () => {
    await storage.open('gallery-api-v0');
    await storage.open('unrelated-cache');
    store();
    await settle();

    expect(await storage.has('gallery-api-v0')).toBeFalse();
    expect(await storage.has('unrelated-cache')).toBeTrue();
  });

  it('keeps the current cache', async () => {
    await storage.open(CACHE_NAME);
    store();
    await settle();

    expect(await storage.has(CACHE_NAME)).toBeTrue();
  });

  it('degrades to nothing when the cache api is missing', async () => {
    TestBed.overrideProvider(RESPONSE_CACHE_STORAGE, { useValue: null });

    await expectAsync(store().write(url, apiResponse([picsumDto()]))).toBeResolved();
    expect(await store().read(url)).toBeNull();
  });

  it('survives a cache that refuses to store', async () => {
    const cache = await storage.open(CACHE_NAME);
    spyOn(cache, 'put').and.rejectWith(new DOMException('Quota exceeded'));

    await expectAsync(store().write(url, apiResponse([picsumDto()]))).toBeResolved();
  });

  it('treats an entry that will not parse as a miss', async () => {
    const cache = await storage.open(CACHE_NAME);
    await cache.put(url, new Response('not json'));

    expect(await store().read(url)).toBeNull();
  });
});
