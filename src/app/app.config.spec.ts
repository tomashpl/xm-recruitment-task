import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { appConfig } from './app.config';
import { PhotoDetailPageComponent } from './features/photo-detail/photo-detail-page.component';
import { photoInfoUrl } from './shared/photos/picsum';
import { picsumDto } from './shared/photos/picsum.test-data';
import { RESPONSE_CACHE_STORAGE, ResponseCacheStore } from './shared/photos/response-cache.store';
import { apiResponse, settle } from './shared/photos/response-cache.test-data';

describe('appConfig', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        ...appConfig.providers,
        provideHttpClientTesting(),
        { provide: RESPONSE_CACHE_STORAGE, useValue: null },
      ],
    });
  });

  it('renders application icons through the Material Symbols font set', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();

    const icon: HTMLElement | null = fixture.nativeElement.querySelector('mat-icon');
    expect(icon).not.toBeNull();
    expect(icon!.classList).toContain('material-symbols-outlined');
  });

  it('binds the route parameter into the photo detail page input', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/photos/564', PhotoDetailPageComponent);
    harness.detectChanges();
    await settle();

    TestBed.inject(HttpTestingController)
      .expectOne(photoInfoUrl('564'))
      .flush(picsumDto({ id: '564' }));
    await harness.fixture.whenStable();

    expect(page.id()).toBe('564');
  });

  it('serves a cached photo without reaching the network', async () => {
    const cache = jasmine.createSpyObj<ResponseCacheStore>('ResponseCacheStore', ['read', 'write']);
    cache.read.and.resolveTo({
      response: apiResponse(picsumDto({ id: '564', author: 'Ada Lovelace' })),
      fresh: true,
    });
    cache.write.and.resolveTo();
    TestBed.overrideProvider(ResponseCacheStore, { useValue: cache });

    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/photos/564', PhotoDetailPageComponent);
    harness.detectChanges();
    await settle();
    await harness.fixture.whenStable();
    harness.detectChanges();

    TestBed.inject(HttpTestingController).expectNone(photoInfoUrl('564'));
    expect(page.id()).toBe('564');
    expect(harness.routeNativeElement!.querySelector('app-photo-meta')!.textContent).toContain(
      'Ada Lovelace',
    );
    expect(cache.write).not.toHaveBeenCalled();
  });
});
