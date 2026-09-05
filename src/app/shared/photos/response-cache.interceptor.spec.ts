import { HttpClient, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { PAGE_SIZE, PICSUM_ORIGIN, photoListUrl } from './picsum';
import { picsumDto, picsumPageHeaders } from './picsum.test-data';
import { picsumCacheInterceptor } from './response-cache.interceptor';
import { ResponseCacheStore } from './response-cache.store';
import { apiResponse, settle } from './response-cache.test-data';

describe('picsumCacheInterceptor', () => {
  const url = photoListUrl(1, PAGE_SIZE);
  let cache: jasmine.SpyObj<ResponseCacheStore>;

  const http = (): HttpClient => TestBed.inject(HttpClient);
  const backend = (): HttpTestingController => TestBed.inject(HttpTestingController);

  beforeEach(() => {
    cache = jasmine.createSpyObj<ResponseCacheStore>('ResponseCacheStore', ['read', 'write']);
    cache.read.and.resolveTo(null);
    cache.write.and.resolveTo();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withFetch(), withInterceptors([picsumCacheInterceptor])),
        provideHttpClientTesting(),
        { provide: ResponseCacheStore, useValue: cache },
      ],
    });
  });

  afterEach(() => {
    backend().verify();
  });

  it('serves a fresh entry without touching the network', async () => {
    const body = [picsumDto()];
    cache.read.and.resolveTo({ response: apiResponse(body, picsumPageHeaders(2)), fresh: true });

    const response = firstValueFrom(http().get(url, { observe: 'response' }));
    await settle();
    backend().expectNone(url);

    expect((await response).body).toEqual(body);
    expect((await response).headers.get('link')).toBe(picsumPageHeaders(2)['Link']);
    expect(cache.write).not.toHaveBeenCalled();
  });

  it('requests a miss and stores the response with its headers', async () => {
    const body = [picsumDto()];

    const response = firstValueFrom(http().get(url, { observe: 'response' }));
    await settle();
    backend()
      .expectOne(url)
      .flush(body, { headers: picsumPageHeaders(2) });

    expect((await response).body).toEqual(body);

    const [storedUrl, storedResponse] = cache.write.calls.mostRecent().args;

    expect(storedUrl).toBe(url);
    expect(storedResponse.headers.get('link')).toBe(picsumPageHeaders(2)['Link']);
  });

  it('revalidates a stale entry and prefers the network', async () => {
    cache.read.and.resolveTo({ response: apiResponse([picsumDto({ id: '1' })]), fresh: false });

    const response = firstValueFrom(http().get(url, { observe: 'response' }));
    await settle();
    backend()
      .expectOne(url)
      .flush([picsumDto({ id: '2' })]);

    expect((await response).body).toEqual([picsumDto({ id: '2' })]);
  });

  it('falls back to a stale entry when the network fails', async () => {
    const body = [picsumDto()];
    cache.read.and.resolveTo({ response: apiResponse(body, picsumPageHeaders(2)), fresh: false });

    const response = firstValueFrom(http().get(url, { observe: 'response' }));
    await settle();
    backend().expectOne(url).error(new ProgressEvent('error'));

    expect((await response).body).toEqual(body);
    expect((await response).headers.get('link')).toBe(picsumPageHeaders(2)['Link']);
  });

  it('reports the error when the network fails and nothing is cached', async () => {
    const response = firstValueFrom(http().get(url, { observe: 'response' }));
    await settle();
    backend().expectOne(url).error(new ProgressEvent('error'));

    await expectAsync(response).toBeRejected();
    expect(cache.write).not.toHaveBeenCalled();
  });

  it('propagates a 404 rather than serving a stale entry', async () => {
    cache.read.and.resolveTo({ response: apiResponse([picsumDto()]), fresh: false });

    const response = firstValueFrom(http().get(url, { observe: 'response' }));
    await settle();
    backend().expectOne(url).flush(null, { status: 404, statusText: 'Not Found' });

    await expectAsync(response).toBeRejected();
  });

  it('serves a stale entry when the network responds with a 503', async () => {
    const body = [picsumDto()];
    cache.read.and.resolveTo({ response: apiResponse(body, picsumPageHeaders(2)), fresh: false });

    const response = firstValueFrom(http().get(url, { observe: 'response' }));
    await settle();
    backend().expectOne(url).flush(null, { status: 503, statusText: 'Service Unavailable' });

    expect((await response).body).toEqual(body);
    expect((await response).headers.get('link')).toBe(picsumPageHeaders(2)['Link']);
  });

  it('reaches the caller with a successful response when the body fails to parse, but does not cache it', async () => {
    const response = firstValueFrom(http().get(url, { observe: 'response' }));
    await settle();
    backend().expectOne(url).flush(picsumDto());

    expect((await response).status).toBe(200);
    expect(cache.write).not.toHaveBeenCalled();
  });

  it('leaves an image url alone, synchronously', async () => {
    const imageUrl = `${PICSUM_ORIGIN}/id/564/600/400`;

    const response = firstValueFrom(http().get(imageUrl, { responseType: 'text' }));
    backend().expectOne(imageUrl).flush('binary');

    expect(await response).toBe('binary');
    expect(cache.read).not.toHaveBeenCalled();
  });

  it('leaves a post alone', async () => {
    const response = firstValueFrom(http().post(url, {}));
    backend().expectOne(url).flush({});

    await response;

    expect(cache.read).not.toHaveBeenCalled();
  });
});
