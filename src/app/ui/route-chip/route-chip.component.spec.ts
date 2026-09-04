import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteChipComponent } from './route-chip.component';

describe('RouteChipComponent', () => {
  let fixture: ComponentFixture<RouteChipComponent>;
  const chip = (): HTMLElement => fixture.nativeElement.querySelector('code');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteChipComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(RouteChipComponent);
    fixture.componentRef.setInput('path', '/favorites');
    await fixture.whenStable();
  });

  it('renders the path in a code element', () => {
    expect(chip().textContent.trim()).toBe('/favorites');
  });

  it('stays hidden from assistive technology because it is a visual aid', () => {
    expect(chip().getAttribute('aria-hidden')).toBe('true');
  });

  it('reflects a changed path', async () => {
    fixture.componentRef.setInput('path', '/photos/abc');
    await fixture.whenStable();
    expect(chip().textContent.trim()).toBe('/photos/abc');
  });
});
