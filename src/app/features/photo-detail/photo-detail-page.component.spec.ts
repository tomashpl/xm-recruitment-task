import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';

import { appConfig } from '../../app.config';
import { MOCK_DETAIL_PHOTO } from '../../shared/fixtures/mock-photos';
import { PhotoDetailPageComponent } from './photo-detail-page.component';

describe('PhotoDetailPageComponent', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [...appConfig.providers],
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/photos/ansel', PhotoDetailPageComponent);
  });

  it('shows a single photo rather than a grid', () => {
    expect(harness.routeNativeElement!.querySelector('app-photo-stage')).not.toBeNull();
    expect(harness.routeNativeElement!.querySelector('app-photo-grid')).toBeNull();
  });

  it('offers the remove from favorites action', () => {
    const button: HTMLButtonElement = harness.routeNativeElement!.querySelector('app-button button')!;
    expect(button.textContent).toContain('Remove from favorites');
  });

  it('shows the author and the download link from the fixture', () => {
    const meta: HTMLElement = harness.routeNativeElement!.querySelector('app-photo-meta')!;
    expect(meta.textContent).toContain(MOCK_DETAIL_PHOTO.author!);
    expect(meta.querySelector('a')!.getAttribute('href')).toBe(MOCK_DETAIL_PHOTO.downloadUrl!);
  });

  it('shows the parameterised route in the chip', () => {
    expect(harness.routeNativeElement!.querySelector('app-route-chip')!.textContent!.trim())
      .toBe('/photos/ansel');
  });

  it('names the section for assistive technology without showing a visible heading', () => {
    const heading: HTMLElement = harness.routeNativeElement!.querySelector('h2')!;
    expect(heading.textContent!.trim()).toBe('Single photo');
    expect(heading.classList).toContain('visually-hidden');
  });

  it('renders a different photo for a different route id', async () => {
    const firstSrc = harness.routeNativeElement!.querySelector('img')!.getAttribute('src');

    await harness.navigateByUrl('/photos/berlin', PhotoDetailPageComponent);
    const secondSrc = harness.routeNativeElement!.querySelector('img')!.getAttribute('src');

    expect(secondSrc).not.toBe(firstSrc);
  });
});
