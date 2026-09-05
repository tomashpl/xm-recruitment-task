import { Injectable, signal } from '@angular/core';

export type GridLayout = 'square' | 'masonry';

export const GRID_LAYOUT_STORAGE_KEY = 'gallery.grid-layout';

const DEFAULT_LAYOUT: GridLayout = 'square';

@Injectable({ providedIn: 'root' })
export class GridLayoutStore {
  private readonly current = signal<GridLayout>(readStoredLayout());

  readonly layout = this.current.asReadonly();

  set(layout: GridLayout): void {
    this.current.set(layout);
    writeStoredLayout(layout);
  }
}

function readStoredLayout(): GridLayout {
  try {
    const stored = localStorage.getItem(GRID_LAYOUT_STORAGE_KEY);
    return stored === 'square' || stored === 'masonry' ? stored : DEFAULT_LAYOUT;
  } catch {
    return DEFAULT_LAYOUT;
  }
}

function writeStoredLayout(layout: GridLayout): void {
  try {
    localStorage.setItem(GRID_LAYOUT_STORAGE_KEY, layout);
  } catch {
    return;
  }
}
