import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';

import { Photo } from '../../models/photo.model';
import { GRID_IMAGE_WIDTH, rescalePhoto } from '../photos/picsum';
import { FAVORITES_STORAGE_KEY, parseFavorites, serializeFavorites } from './favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesStore {
  private readonly entries = signal<readonly Photo[]>(readStored());
  private readonly ids = computed(() => new Set(this.entries().map(photo => photo.id)));

  readonly photos = this.entries.asReadonly();
  readonly count = computed(() => this.entries().length);

  constructor() {
    const follow = (event: StorageEvent): void => {
      if (event.storageArea !== localStorage) {
        return;
      }

      if (event.key !== null && event.key !== FAVORITES_STORAGE_KEY) {
        return;
      }

      this.entries.set(readStored());
    };

    window.addEventListener('storage', follow);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', follow));
  }

  isFavorite(id: string): boolean {
    return this.ids().has(id);
  }

  toggle(photo: Photo): boolean {
    const added = !this.isFavorite(photo.id);

    this.entries.update(current =>
      added
        ? [rescalePhoto(photo, GRID_IMAGE_WIDTH), ...current]
        : current.filter(entry => entry.id !== photo.id),
    );

    writeStored(this.entries());

    return added;
  }
}

function readStored(): readonly Photo[] {
  try {
    return parseFavorites(localStorage.getItem(FAVORITES_STORAGE_KEY));
  } catch {
    return [];
  }
}

function writeStored(photos: readonly Photo[]): void {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, serializeFavorites(photos));
  } catch {
    return;
  }
}
