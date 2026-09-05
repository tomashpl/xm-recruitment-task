import { samplePhoto } from '../../shared/photos/picsum.test-data';
import { GridMetrics, masonrySpan, photoAspectRatio } from './masonry';

describe('masonry', () => {
  const metrics: GridMetrics = { columnWidth: 200, gap: 8, rowUnit: 4 };

  it('spans the rows a landscape tile needs, including the gap', () => {
    const photo = samplePhoto({ width: 600, height: 400 });
    expect(masonrySpan(photo, metrics)).toBe(36);
  });

  it('spans more rows for a portrait than for a landscape of the same width', () => {
    const landscape = samplePhoto({ width: 600, height: 400 });
    const portrait = samplePhoto({ width: 400, height: 600 });
    expect(masonrySpan(portrait, metrics)).toBeGreaterThan(masonrySpan(landscape, metrics));
  });

  it('rounds a partial row up so a tile is never clipped', () => {
    const photo = samplePhoto({ width: 600, height: 401 });
    expect(masonrySpan(photo, metrics)).toBe(36);
    expect(masonrySpan(samplePhoto({ width: 600, height: 500 }), metrics)).toBe(44);
  });

  it('falls back to a single row before the grid has been measured', () => {
    const photo = samplePhoto({ width: 600, height: 400 });
    expect(masonrySpan(photo, { columnWidth: 0, gap: 8, rowUnit: 4 })).toBe(1);
    expect(masonrySpan(photo, { columnWidth: 200, gap: 8, rowUnit: 0 })).toBe(1);
  });

  it('describes the photo ratio for a css aspect-ratio', () => {
    expect(photoAspectRatio(samplePhoto({ width: 600, height: 400 }))).toBe('600 / 400');
  });
});
