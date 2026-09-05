import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideGalleryUi } from '../provide-gallery-ui';
import { EmptyStateComponent } from './empty-state.component';

@Component({
  imports: [EmptyStateComponent],
  template: `
    <ui-empty-state icon="favorite_border" message="No favorites yet.">
      <button type="button">Browse photos</button>
    </ui-empty-state>
  `,
})
class HostComponent {}

describe('EmptyStateComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection(), provideGalleryUi()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  it('renders the message', () => {
    expect(fixture.nativeElement.textContent).toContain('No favorites yet.');
  });

  it('renders the requested icon', () => {
    expect(fixture.nativeElement.querySelector('mat-icon').textContent.trim()).toBe(
      'favorite_border',
    );
  });

  it('projects the action control', () => {
    expect(fixture.nativeElement.querySelector('button').textContent.trim()).toBe('Browse photos');
  });

  it('keeps the decorative icon out of the accessibility tree', () => {
    expect(fixture.nativeElement.querySelector('mat-icon').getAttribute('aria-hidden')).toBe(
      'true',
    );
  });
});
