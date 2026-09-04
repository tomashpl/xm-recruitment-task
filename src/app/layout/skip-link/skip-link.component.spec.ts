import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkipLinkComponent } from './skip-link.component';

describe('SkipLinkComponent', () => {
  let fixture: ComponentFixture<SkipLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkipLinkComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SkipLinkComponent);
    fixture.componentRef.setInput('target', 'main-content');
    await fixture.whenStable();
  });

  it('links to the fragment of the given target', () => {
    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(anchor.getAttribute('href')).toBe('#main-content');
  });

  it('uses the default label', () => {
    expect(fixture.nativeElement.querySelector('a').textContent.trim()).toBe('Skip to photos');
  });

  it('uses a custom label when one is provided', async () => {
    fixture.componentRef.setInput('label', 'Skip to favorites');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('a').textContent.trim()).toBe('Skip to favorites');
  });
});
