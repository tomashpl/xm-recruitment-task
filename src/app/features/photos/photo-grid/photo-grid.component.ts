import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { Photo } from '../../../models/photo.model';
import { GridLayout } from '../../../shared/preferences/grid-layout';
import { GridMetrics, masonrySpan, photoAspectRatio } from '../masonry';

const UNMEASURED: GridMetrics = { columnWidth: 0, gap: 0, rowUnit: 0 };

@Component({
  selector: 'app-photo-grid',
  templateUrl: './photo-grid.component.html',
  styleUrl: './photo-grid.component.scss',
  host: { '[class.app-photo-grid--masonry]': 'isMasonry()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoGridComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly list = viewChild.required<ElementRef<HTMLUListElement>>('list');
  private readonly measured = signal<GridMetrics>(UNMEASURED);

  readonly layout = input<GridLayout>('square');

  readonly metrics = this.measured.asReadonly();

  protected readonly isMasonry = computed(() => this.layout() === 'masonry');

  constructor() {
    afterNextRender(() => {
      const element = this.list().nativeElement;
      const observer = new ResizeObserver(() => this.measure());
      observer.observe(element);
      this.destroyRef.onDestroy(() => observer.disconnect());
      this.measure();
    });
  }

  measure(): void {
    const element = this.list().nativeElement;
    const item = element.querySelector('li');
    const styles = getComputedStyle(element);

    this.measured.set({
      columnWidth: item?.getBoundingClientRect().width ?? 0,
      gap: parseFloat(styles.columnGap) || 0,
      rowUnit: parseFloat(styles.gridAutoRows) || 0,
    });
  }

  spanFor(photo: Photo): string | null {
    return this.isMasonry() ? `span ${masonrySpan(photo, this.metrics())}` : null;
  }

  ratioFor(photo: Photo): string | null {
    return this.isMasonry() ? photoAspectRatio(photo) : null;
  }
}
