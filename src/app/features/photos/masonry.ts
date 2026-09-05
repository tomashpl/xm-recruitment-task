import { Photo } from '../../models/photo.model';

export interface GridMetrics {
  readonly columnWidth: number;
  readonly gap: number;
  readonly rowUnit: number;
}

export function masonrySpan(photo: Photo, metrics: GridMetrics): number {
  if (metrics.columnWidth <= 0 || metrics.rowUnit <= 0) {
    return 1;
  }

  const tileHeight = (metrics.columnWidth * photo.height) / photo.width;

  return Math.ceil((tileHeight + metrics.gap) / metrics.rowUnit);
}

export function photoAspectRatio(photo: Photo): string {
  return `${photo.width} / ${photo.height}`;
}
