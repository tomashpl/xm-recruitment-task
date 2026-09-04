import { ComponentFixture, TestBed } from '@angular/core/testing';

import { appConfig } from '../../../app.config';
import { FavoriteBadgeComponent } from './favorite-badge.component';

describe('FavoriteBadgeComponent', () => {
  let fixture: ComponentFixture<FavoriteBadgeComponent>;
  const icon = (): HTMLElement => fixture.nativeElement.querySelector('mat-icon');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteBadgeComponent],
      providers: [...appConfig.providers],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoriteBadgeComponent);
    await fixture.whenStable();
  });

  it('shows the outline heart while inactive', () => {
    expect(icon().textContent.trim()).toBe('favorite_border');
  });

  it('shows the filled heart once active', async () => {
    fixture.componentRef.setInput('active', true);
    await fixture.whenStable();
    expect(icon().textContent.trim()).toBe('favorite');
  });

  it('stays out of the accessibility tree because the tile carries the label', () => {
    expect(fixture.nativeElement.querySelector('span').getAttribute('aria-hidden')).toBe('true');
  });

  it('applies the large size modifier when asked', async () => {
    fixture.componentRef.setInput('size', 'lg');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('span').classList).toContain('app-favorite-badge--lg');
  });
});
