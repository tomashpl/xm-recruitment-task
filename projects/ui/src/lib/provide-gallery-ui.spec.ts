import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';

import { provideGalleryUi } from './provide-gallery-ui';

@Component({
  selector: 'ui-icon-registry-host',
  imports: [MatIconModule],
  template: '<mat-icon>favorite</mat-icon>',
})
class IconRegistryHostComponent {}

describe('provideGalleryUi', () => {
  it('registers the Material Symbols font set as the default, so the library needs no setup from its host', async () => {
    await TestBed.configureTestingModule({
      imports: [IconRegistryHostComponent],
      providers: [provideZonelessChangeDetection(), provideGalleryUi()],
    }).compileComponents();

    const fixture = TestBed.createComponent(IconRegistryHostComponent);
    await fixture.whenStable();

    const icon: HTMLElement = fixture.nativeElement.querySelector('mat-icon');
    expect(icon.classList).toContain('material-symbols-outlined');
  });
});
