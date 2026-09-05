import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  let fixture: ComponentFixture<SpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    await fixture.whenStable();
  });

  it('renders an indeterminate Material spinner', () => {
    const spinner: HTMLElement = fixture.nativeElement.querySelector('mat-progress-spinner');
    expect(spinner.getAttribute('mode')).toBe('indeterminate');
  });

  it('hides itself from assistive technology so the wrapper owns the announcement', () => {
    expect(
      fixture.nativeElement.querySelector('mat-progress-spinner').getAttribute('aria-hidden'),
    ).toBe('true');
  });
});
