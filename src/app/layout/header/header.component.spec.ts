import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideGalleryUi } from '@gallery/ui';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideGalleryUi()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    await fixture.whenStable();
  });

  it('is the banner landmark', () => {
    expect(fixture.nativeElement.querySelector('header').getAttribute('role')).toBe('banner');
  });

  it('always shows the title and the view tabs', () => {
    expect(fixture.nativeElement.querySelector('app-title')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-view-tabs')).not.toBeNull();
  });

  it('carries no back control because the detail page owns it', () => {
    expect(fixture.nativeElement.querySelector('ui-icon-button')).toBeNull();
    expect(fixture.nativeElement.querySelector('button[aria-label="Go back"]')).toBeNull();
  });
});
