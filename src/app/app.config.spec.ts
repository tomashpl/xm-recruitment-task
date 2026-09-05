import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { appConfig } from './app.config';
import { PhotoDetailPageComponent } from './features/photo-detail/photo-detail-page.component';

describe('appConfig', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [...appConfig.providers],
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
    const page = await harness.navigateByUrl('/photos/ansel', PhotoDetailPageComponent);

    expect(page.id()).toBe('ansel');
  });
});
