import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideGalleryUi } from '@gallery/ui';

import { GridLayout } from '../../../shared/preferences/grid-layout';
import { GridLayoutToggleComponent } from './grid-layout-toggle.component';

describe('GridLayoutToggleComponent', () => {
  let fixture: ComponentFixture<GridLayoutToggleComponent>;

  const buttons = (): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('button'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridLayoutToggleComponent],
      providers: [provideZonelessChangeDetection(), provideGalleryUi()],
    }).compileComponents();

    fixture = TestBed.createComponent(GridLayoutToggleComponent);
    fixture.componentRef.setInput('layout', 'square');
    await fixture.whenStable();
  });

  it('names the control for assistive technology', () => {
    const group: HTMLElement = fixture.nativeElement.querySelector('[role="group"]');
    expect(group.getAttribute('aria-label')).toBe('Grid layout');
  });

  it('offers one button per layout, each labelled', () => {
    expect(buttons().length).toBe(2);
    expect(buttons().map(button => button.getAttribute('aria-label'))).toEqual([
      'Square tiles',
      'Original proportions',
    ]);
  });

  it('reports the active layout as pressed', () => {
    expect(buttons().map(button => button.getAttribute('aria-pressed'))).toEqual(['true', 'false']);
  });

  it('moves the pressed state when the layout changes', async () => {
    fixture.componentRef.setInput('layout', 'masonry');
    await fixture.whenStable();
    expect(buttons().map(button => button.getAttribute('aria-pressed'))).toEqual(['false', 'true']);
  });

  it('emits the layout each button represents', () => {
    const emitted: GridLayout[] = [];
    fixture.componentInstance.layoutChange.subscribe(layout => emitted.push(layout));

    buttons()[1].click();
    buttons()[0].click();

    expect(emitted).toEqual(['masonry', 'square']);
  });
});
