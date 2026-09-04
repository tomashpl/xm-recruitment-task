import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';

import { AppComponent } from './app.component';
import { routes } from './app.routes';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideZonelessChangeDetection(), provideRouter(routes, withComponentInputBinding())],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
  });

  it('renders a main landmark the skip link can target', () => {
    const main: HTMLElement = fixture.nativeElement.querySelector('main');
    expect(main.id).toBe('main-content');
    expect(main.getAttribute('tabindex')).toBe('-1');
  });

  it('renders a polite live region for later announcements', () => {
    const status: HTMLElement = fixture.nativeElement.querySelector('[role="status"]');
    expect(status.getAttribute('aria-live')).toBe('polite');
  });

  it('keeps the shell free of route-specific controls on the detail route', async () => {
    await TestBed.inject(Router).navigateByUrl('/photos/ansel');
    await fixture.whenStable();
    const header: HTMLElement = fixture.nativeElement.querySelector('app-header');
    expect(header.querySelector('button[aria-label="Go back"]')).toBeNull();
  });

  it('renders the sticky header outside the routed content', () => {
    const header: HTMLElement = fixture.nativeElement.querySelector('app-header');
    const main: HTMLElement = fixture.nativeElement.querySelector('main');
    expect(header).not.toBeNull();
    expect(main.contains(header)).toBeFalse();
  });
});
