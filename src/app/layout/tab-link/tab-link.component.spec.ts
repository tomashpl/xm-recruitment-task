import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideGalleryUi } from '@gallery/ui';

import { TabLinkComponent } from './tab-link.component';

@Component({
  imports: [TabLinkComponent],
  template: `
    <app-tab-link link="/favorites" icon="favorite_border" activeIcon="favorite" label="Favorites">
      <span class="badge-slot">7</span>
    </app-tab-link>
  `,
})
class HostComponent {}

describe('TabLinkComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  const anchor = (): HTMLAnchorElement => fixture.nativeElement.querySelector('a');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: 'favorites', children: [] }]),
        provideGalleryUi(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  it('renders an anchor pointing at the target route', () => {
    expect(anchor().getAttribute('href')).toBe('/favorites');
  });

  it('renders the label', () => {
    expect(anchor().textContent).toContain('Favorites');
  });

  it('projects the badge', () => {
    expect(fixture.nativeElement.querySelector('.badge-slot').textContent.trim()).toBe('7');
  });

  it('shows the outline icon and no current marker while inactive', () => {
    expect(fixture.nativeElement.querySelector('mat-icon').textContent.trim()).toBe('favorite_border');
    expect(anchor().getAttribute('aria-current')).toBeNull();
  });

  it('marks itself as the current page and swaps to the active icon when navigated to', async () => {
    await TestBed.inject(Router).navigateByUrl('/favorites');
    await fixture.whenStable();
    expect(anchor().getAttribute('aria-current')).toBe('page');
    expect(fixture.nativeElement.querySelector('mat-icon').textContent.trim()).toBe('favorite');
  });
});
