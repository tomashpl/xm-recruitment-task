import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { effect, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { PHOTO_STREAM_RETRY_DELAYS, PhotoStreamStore } from './photo-stream.store';
import { MAX_PAGES, PAGE_SIZE, photoListUrl } from './picsum';
import { picsumDtoList, picsumPageHeaders } from './picsum.test-data';

describe('PhotoStreamStore', () => {
  let store: PhotoStreamStore;
  let httpMock: HttpTestingController;

  async function settle(): Promise<void> {
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    TestBed.tick();
  }

  async function deliver(page: number, count: number, nextPage: number | null): Promise<void> {
    await settle();
    httpMock
      .expectOne(photoListUrl(page, PAGE_SIZE))
      .flush(picsumDtoList(count, (page - 1) * PAGE_SIZE), {
        headers: picsumPageHeaders(nextPage),
      });
    await settle();
  }

  async function fail(page: number, status = 500): Promise<void> {
    await settle();
    httpMock
      .expectOne(photoListUrl(page, PAGE_SIZE))
      .flush(null, { status, statusText: 'Server Error' });
    await settle();
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PHOTO_STREAM_RETRY_DELAYS, useValue: [] },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(PhotoStreamStore);
    TestBed.runInInjectionContext(() => effect(() => store.photos()));
    await settle();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests the first page as soon as it is injected', async () => {
    await deliver(1, 30, 2);
    expect(store.photos().length).toBe(30);
  });

  it('requests nothing further on its own', async () => {
    await deliver(1, 30, 2);
    await settle();

    expect(store.canLoadMore()).toBeTrue();
    httpMock.verify();
  });

  it('appends the next page instead of replacing the first', async () => {
    await deliver(1, 30, 2);
    store.loadNext();
    await deliver(2, 30, 3);

    expect(store.photos().length).toBe(60);
    expect(store.photos()[0].id).toBe('0');
    expect(store.photos()[30].id).toBe('30');
  });

  it('ignores loadNext while a request is in flight', async () => {
    await deliver(1, 30, 2);
    store.loadNext();
    store.loadNext();
    await deliver(2, 30, 3);

    expect(store.photos().length).toBe(60);
  });

  it('reports the end of the collection when no next page is offered', async () => {
    await deliver(1, 3, null);

    expect(store.hasMore()).toBeFalse();
    expect(store.canLoadMore()).toBeFalse();
    expect(store.isComplete()).toBeTrue();

    store.loadNext();
    await settle();
    httpMock.verify();
  });

  it('appends a retried page exactly once', async () => {
    await fail(1);
    store.retry();
    await deliver(1, 30, 2);

    expect(store.photos().length).toBe(30);
  });

  it('keeps the loaded photos when a later page fails', async () => {
    await deliver(1, 30, 2);
    store.loadNext();
    await fail(2);

    expect(store.photos().length).toBe(30);
    expect(store.inlineError()).toBeTrue();
    expect(store.fatalError()).toBeFalse();
  });

  it('reports a fatal error when the first page fails', async () => {
    await fail(1);

    expect(store.photos().length).toBe(0);
    expect(store.fatalError()).toBeTrue();
    expect(store.inlineError()).toBeFalse();
  });

  it('separates the first-page loader from the append loader', async () => {
    expect(store.isLoadingFirstPage()).toBeTrue();
    await deliver(1, 30, 2);

    store.loadNext();
    await settle();
    expect(store.isLoadingMore()).toBeTrue();
    expect(store.isLoadingFirstPage()).toBeFalse();

    await deliver(2, 30, 3);
    expect(store.isLoadingMore()).toBeFalse();
  });

  it('stops advancing at the page cap even while the api offers more', async () => {
    await deliver(1, 30, 2);

    for (let page = 2; page <= MAX_PAGES; page++) {
      store.loadNext();
      await deliver(page, 30, page + 1);
    }

    expect(store.canLoadMore()).toBeFalse();
    store.loadNext();
    await settle();
    httpMock.verify();
  });

  it('remembers a scroll offset it is given', async () => {
    store.rememberScroll(1200);
    expect(store.scrollOffset()).toBe(1200);

    await deliver(1, 30, 2);
  });
});
