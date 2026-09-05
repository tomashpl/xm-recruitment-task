import { HttpHeaders, HttpResponse } from '@angular/common/http';

export function apiResponse(
  body: unknown,
  headers: Record<string, string> = {},
): HttpResponse<unknown> {
  return new HttpResponse({
    body,
    headers: new HttpHeaders(headers),
    status: 200,
    statusText: 'OK',
  });
}

type FakeCacheStorage = Pick<CacheStorage, 'open' | 'has' | 'keys' | 'delete' | 'match'>;
type FakeCache = Pick<Cache, 'match' | 'put' | 'delete'>;

export function fakeCacheStorage(): CacheStorage {
  const opened = new Map<string, Cache>();

  const open = (name: string): Cache => {
    const existing = opened.get(name);

    if (existing) {
      return existing;
    }

    const created = fakeCache();
    opened.set(name, created);

    return created;
  };

  const storage: FakeCacheStorage = {
    open: (name: string) => Promise.resolve(open(name)),
    has: (name: string) => Promise.resolve(opened.has(name)),
    keys: () => Promise.resolve([...opened.keys()]),
    delete: (name: string) => Promise.resolve(opened.delete(name)),
    match: () => Promise.resolve(undefined),
  };

  return storage as CacheStorage;
}

export function settle(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve));
}

function fakeCache(): Cache {
  const entries = new Map<string, Response>();

  const cache: FakeCache = {
    match: (request: RequestInfo | URL) => Promise.resolve(entries.get(String(request))?.clone()),
    put: (request: RequestInfo | URL, response: Response) => {
      entries.set(String(request), response);

      return Promise.resolve();
    },
    delete: (request: RequestInfo | URL) => Promise.resolve(entries.delete(String(request))),
  };

  return cache as Cache;
}
