import { Location } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideGalleryUi } from '@gallery/ui';

import { MOCK_DETAIL_PHOTO } from '../../shared/fixtures/mock-photos';
import { PhotoDetailPageComponent } from './photo-detail-page.component';

describe('PhotoDetailPageComponent', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(
          [{ path: 'photos/:id', component: PhotoDetailPageComponent }],
          withComponentInputBinding(),
        ),
        provideGalleryUi(),
      ],
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/photos/ansel', PhotoDetailPageComponent);
  });

  it('shows a single photo rather than a grid', () => {
    expect(harness.routeNativeElement!.querySelector('app-photo-stage')).not.toBeNull();
    expect(harness.routeNativeElement!.querySelector('app-photo-grid')).toBeNull();
  });

  it('offers the remove from favorites action', () => {
    const button: HTMLButtonElement =
      harness.routeNativeElement!.querySelector('ui-button button')!;
    expect(button.textContent).toContain('Remove from favorites');
  });

  it('shows the author from the fixture', () => {
    const meta: HTMLElement = harness.routeNativeElement!.querySelector('app-photo-meta')!;
    expect(meta.textContent).toContain(MOCK_DETAIL_PHOTO.author);
  });

  it('puts the back control ahead of the author', () => {
    const header: HTMLElement = harness.routeNativeElement!.querySelector('.app-page__header')!;
    const children = Array.from(header.children).map(child => child.tagName.toLowerCase());
    expect(children.indexOf('ui-icon-button')).toBe(0);
    expect(children.indexOf('ui-icon-button')).toBeLessThan(children.indexOf('app-photo-meta'));
  });

  it('keeps the header row as tall as it would be without the back control', () => {
    const header: HTMLElement = harness.routeNativeElement!.querySelector('.app-page__header')!;
    const back: HTMLElement = header.querySelector('ui-icon-button')!;
    const tallestSibling = Math.max(
      ...Array.from(header.children)
        .filter(child => child !== back)
        .map(child => child.getBoundingClientRect().height),
    );

    expect(back.getBoundingClientRect().height).toBeLessThanOrEqual(tallestSibling);
    expect(header.getBoundingClientRect().height).toBe(tallestSibling);
  });

  it('walks the history back when the back control is pressed', () => {
    const spy = spyOn(TestBed.inject(Location), 'back');
    const button: HTMLButtonElement = harness.routeNativeElement!.querySelector(
      'button[aria-label="Go back"]',
    )!;
    button.click();
    expect(spy).toHaveBeenCalledTimes(1);
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
