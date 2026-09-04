import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { AppComponent } from './app.component';
import { routes } from './app.routes';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideZonelessChangeDetection(), provideRouter(routes)],
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

  it('reports the current url and hides the back affordance outside the detail route', async () => {
    await TestBed.inject(Router).navigateByUrl('/favorites');
    await fixture.whenStable();
    expect(fixture.componentInstance['url']()).toBe('/favorites');
    expect(fixture.componentInstance['showBack']()).toBeFalse();
  });

  it('shows the back affordance on the detail route', async () => {
    await TestBed.inject(Router).navigateByUrl('/photos/abc');
    await fixture.whenStable();
    expect(fixture.componentInstance['showBack']()).toBeTrue();
  });

  it('renders the sticky header outside the routed content', () => {
    const header: HTMLElement = fixture.nativeElement.querySelector('app-header');
    const main: HTMLElement = fixture.nativeElement.querySelector('main');
    expect(header).not.toBeNull();
    expect(main.contains(header)).toBeFalse();
  });
});
