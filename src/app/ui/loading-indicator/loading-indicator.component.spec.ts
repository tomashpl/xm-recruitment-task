import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingIndicatorComponent } from './loading-indicator.component';

describe('LoadingIndicatorComponent', () => {
  let fixture: ComponentFixture<LoadingIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingIndicatorComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingIndicatorComponent);
    await fixture.whenStable();
  });

  it('announces itself politely as a status region', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('role')).toBe('status');
    expect(host.getAttribute('aria-live')).toBe('polite');
  });

  it('shows the default message', () => {
    expect(fixture.nativeElement.textContent).toContain('Loading photos');
  });

  it('shows a custom message', async () => {
    fixture.componentRef.setInput('message', 'Loading favorites…');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Loading favorites');
  });
});
