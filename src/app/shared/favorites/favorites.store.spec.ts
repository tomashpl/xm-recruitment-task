import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DETAIL_IMAGE_WIDTH, GRID_IMAGE_WIDTH, toPhoto } from '../photos/picsum';
import { picsumDto, samplePhoto } from '../photos/picsum.test-data';
import { FAVORITES_STORAGE_KEY, serializeFavorites } from './favorites';
import { FavoritesStore } from './favorites.store';

describe('FavoritesStore', () => {
  const store = (): FavoritesStore => TestBed.inject(FavoritesStore);

  beforeEach(() => {
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  afterEach(() => {
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
  });

  it('starts empty when nothing is stored', () => {
    expect(store().photos()).toEqual([]);
    expect(store().count()).toBe(0);
  });

  it('reads a stored list when it is created', () => {
    const photo = samplePhoto({ id: '7' });
    localStorage.setItem(FAVORITES_STORAGE_KEY, serializeFavorites([photo]));
    expect(store().photos()).toEqual([photo]);
    expect(store().isFavorite('7')).toBeTrue();
  });

  it('adds a photo at the front and reports that it was added', () => {
    const first = samplePhoto({ id: '1' });
    const second = samplePhoto({ id: '2' });
    expect(store().toggle(first)).toBeTrue();
    expect(store().toggle(second)).toBeTrue();
    expect(
      store()
        .photos()
        .map(photo => photo.id),
    ).toEqual(['2', '1']);
    expect(store().count()).toBe(2);
  });

  it('removes a photo it already holds and reports that it was removed', () => {
    const photo = samplePhoto({ id: '1' });
    store().toggle(photo);
    expect(store().toggle(photo)).toBeFalse();
    expect(store().photos()).toEqual([]);
    expect(store().isFavorite('1')).toBeFalse();
  });

  it('persists the list it holds', () => {
    const photo = samplePhoto({ id: '1' });
    store().toggle(photo);
    expect(localStorage.getItem(FAVORITES_STORAGE_KEY)).toBe(serializeFavorites([photo]));
  });

  it('stores a detail-sized photo at the grid width', () => {
    store().toggle(toPhoto(picsumDto({ id: '9' }), DETAIL_IMAGE_WIDTH));
    expect(store().photos()[0].width).toBe(GRID_IMAGE_WIDTH);
  });

  it('starts empty when reading storage throws', () => {
    spyOn(Storage.prototype, 'getItem').and.throwError('SecurityError');
    expect(store().photos()).toEqual([]);
  });

  it('keeps the list for this session when writing storage throws', () => {
    spyOn(Storage.prototype, 'setItem').and.throwError('QuotaExceededError');
    store().toggle(samplePhoto({ id: '1' }));
    expect(store().count()).toBe(1);
  });

  it('follows the key when another tab changes it', () => {
    const photo = samplePhoto({ id: '5' });
    const created = store();
    localStorage.setItem(FAVORITES_STORAGE_KEY, serializeFavorites([photo]));
    window.dispatchEvent(new StorageEvent('storage', { key: FAVORITES_STORAGE_KEY }));
    expect(created.photos()).toEqual([photo]);
  });

  it('ignores a change to another key', () => {
    const created = store();
    localStorage.setItem(FAVORITES_STORAGE_KEY, serializeFavorites([samplePhoto({ id: '5' })]));
    window.dispatchEvent(new StorageEvent('storage', { key: 'gallery.grid-layout' }));
    expect(created.photos()).toEqual([]);
  });
});
