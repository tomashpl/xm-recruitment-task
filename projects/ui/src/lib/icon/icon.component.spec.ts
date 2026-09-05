import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconComponent } from './icon.component';
import { provideGalleryUi } from '../provide-gallery-ui';

describe('IconComponent', () => {
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconComponent],
      providers: [provideZonelessChangeDetection(), provideGalleryUi()],
    }).compileComponents();

    fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', 'favorite');
    await fixture.whenStable();
  });

  it('renders the ligature through the Material Symbols font set', () => {
    const icon: HTMLElement = fixture.nativeElement.querySelector('mat-icon');
    expect(icon.textContent.trim()).toBe('favorite');
    expect(icon.classList).toContain('material-symbols-outlined');
  });

  it('is hidden from assistive technology because the host labels it', () => {
    expect(fixture.nativeElement.querySelector('mat-icon').getAttribute('aria-hidden')).toBe(
      'true',
    );
  });

  it('never transitions its own geometry, so a freshly rendered icon cannot animate in from the Material default size', () => {
    const icon: HTMLElement = fixture.nativeElement.querySelector('mat-icon');
    const transitioned = getComputedStyle(icon)
      .transitionProperty.split(',')
      .map(property => property.trim());
    expect(transitioned).not.toContain('font-size');
    expect(transitioned).not.toContain('width');
    expect(transitioned).not.toContain('height');
  });

  it('switches to the filled variation when asked', async () => {
    fixture.componentRef.setInput('filled', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('mat-icon').classList).toContain('ui-icon--filled');
  });
});
