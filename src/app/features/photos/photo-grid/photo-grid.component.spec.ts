import {
  ChangeDetectionStrategy,
  Component,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Photo } from '../../../models/photo.model';
import { samplePhoto } from '../../../shared/photos/picsum.test-data';
import { GridLayout } from '../../../shared/preferences/grid-layout';
import { masonrySpan } from '../masonry';
import { PhotoGridComponent } from './photo-grid.component';

@Component({
  imports: [PhotoGridComponent],
  template: `
    <app-photo-grid #grid [layout]="layout()">
      @for (photo of photos(); track photo.id) {
        <li [style.grid-row-end]="grid.spanFor(photo)"></li>
      }
    </app-photo-grid>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class GridHostComponent {
  readonly layout = signal<GridLayout>('square');
  readonly photos = signal<readonly Photo[]>([
    samplePhoto({ id: '1', width: 600, height: 400 }),
    samplePhoto({ id: '2', width: 400, height: 600 }),
    samplePhoto({ id: '3', width: 600, height: 600 }),
  ]);
}

describe('PhotoGridComponent', () => {
  let fixture: ComponentFixture<GridHostComponent>;

  const list = (): HTMLElement => fixture.nativeElement.querySelector('ul');
  const items = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('li'));
  const grid = (): PhotoGridComponent =>
    fixture.debugElement.children[0].componentInstance as PhotoGridComponent;

  async function afterPaint(): Promise<void> {
    await new Promise<void>(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(GridHostComponent);
    await fixture.whenStable();
    await afterPaint();
  });

  it('exposes an explicit list role that survives the list-style reset', () => {
    expect(list().getAttribute('role')).toBe('list');
  });

  it('projects its cells into the list', () => {
    expect(list().querySelectorAll('li').length).toBe(3);
  });

  it('lays the cells out as a grid', () => {
    expect(getComputedStyle(list()).display).toBe('grid');
  });

  it('keeps a plain row grid in the square layout', () => {
    const styles = getComputedStyle(list());
    expect(styles.gridAutoRows).toBe('auto');
    expect(parseFloat(styles.rowGap)).toBeGreaterThan(0);
  });

  it('applies no row span in the square layout', () => {
    expect(grid().spanFor(fixture.componentInstance.photos()[0])).toBeNull();
    expect(items()[0].style.gridRowEnd).toBe('');
  });

  it('applies no aspect ratio in the square layout', () => {
    expect(grid().ratioFor(fixture.componentInstance.photos()[0])).toBeNull();
  });

  it('switches to a fine row track with no row gap in the masonry layout', async () => {
    fixture.componentInstance.layout.set('masonry');
    await fixture.whenStable();
    const styles = getComputedStyle(list());
    expect(parseFloat(styles.gridAutoRows)).toBe(4);
    expect(parseFloat(styles.rowGap)).toBe(0);
  });

  it('measures its own column width, gap and row unit', async () => {
    fixture.componentInstance.layout.set('masonry');
    await fixture.whenStable();
    await afterPaint();

    const metrics = grid().metrics();
    expect(metrics.columnWidth).toBeCloseTo(items()[0].getBoundingClientRect().width, 1);
    expect(metrics.columnWidth).toBeGreaterThan(0);
    expect(metrics.gap).toBe(8);
    expect(metrics.rowUnit).toBe(4);
  });

  it('spans each tile by the rows its own ratio needs', async () => {
    fixture.componentInstance.layout.set('masonry');
    await fixture.whenStable();
    await afterPaint();
    await fixture.whenStable();

    const [landscape, portrait] = fixture.componentInstance.photos();
    const expectedSpan = `span ${masonrySpan(landscape, grid().metrics())}`;
    expect(grid().spanFor(landscape)).toBe(expectedSpan);
    expect(items()[0].style.gridRowEnd).toBe(expectedSpan);
    expect(masonrySpan(portrait, grid().metrics())).toBeGreaterThan(
      masonrySpan(landscape, grid().metrics()),
    );
  });

  it('reports the photo ratio for the tile in the masonry layout', async () => {
    fixture.componentInstance.layout.set('masonry');
    await fixture.whenStable();
    expect(grid().ratioFor(fixture.componentInstance.photos()[1])).toBe('400 / 600');
  });
});
