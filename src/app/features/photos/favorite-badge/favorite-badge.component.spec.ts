import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideGalleryUi } from '@gallery/ui';

import { FavoriteBadgeComponent } from './favorite-badge.component';

describe('FavoriteBadgeComponent', () => {
  let fixture: ComponentFixture<FavoriteBadgeComponent>;
  const icon = (): HTMLElement => fixture.nativeElement.querySelector('mat-icon');
  const badge = (): HTMLElement => fixture.nativeElement.querySelector('span');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteBadgeComponent],
      providers: [provideZonelessChangeDetection(), provideGalleryUi()],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoriteBadgeComponent);
    await fixture.whenStable();
  });

  it('keeps the same heart glyph and leaves it unfilled while inactive', () => {
    expect(icon().textContent.trim()).toBe('favorite');
    expect(icon().classList).not.toContain('ui-icon--filled');
  });

  it('fills the heart once active', async () => {
    fixture.componentRef.setInput('active', true);
    await fixture.whenStable();
    expect(icon().textContent.trim()).toBe('favorite');
    expect(icon().classList).toContain('ui-icon--filled');
  });

  it('stays out of the accessibility tree because the tile carries the label', () => {
    expect(badge().getAttribute('aria-hidden')).toBe('true');
  });

  it('grows the badge while expanded and scales the glyph instead of resizing it', async () => {
    expect(badge().classList).not.toContain('app-favorite-badge--expanded');
    expect(icon().style.fontSize).toBe('22px');

    fixture.componentRef.setInput('expanded', true);
    await fixture.whenStable();

    expect(badge().classList).toContain('app-favorite-badge--expanded');
    expect(icon().style.fontSize).toBe('22px');
  });
});
