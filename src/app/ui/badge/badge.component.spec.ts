import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
  let fixture: ComponentFixture<BadgeComponent>;
  const badge = (): HTMLElement => fixture.nativeElement.querySelector('span');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeComponent);
    fixture.componentRef.setInput('count', 3);
    await fixture.whenStable();
  });

  it('renders the count', () => {
    expect(badge().textContent.trim()).toBe('3');
  });

  it('stays hidden from assistive technology', () => {
    expect(badge().getAttribute('aria-hidden')).toBe('true');
  });

  it('marks the active styling when the surrounding tab is current', async () => {
    expect(badge().classList).not.toContain('app-badge--active');
    fixture.componentRef.setInput('active', true);
    await fixture.whenStable();
    expect(badge().classList).toContain('app-badge--active');
  });
});
