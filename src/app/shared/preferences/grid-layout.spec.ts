import { GRID_LAYOUT_STORAGE_KEY, GridLayoutStore } from './grid-layout';

describe('GridLayoutStore', () => {
  beforeEach(() => {
    localStorage.removeItem(GRID_LAYOUT_STORAGE_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(GRID_LAYOUT_STORAGE_KEY);
  });

  it('starts square when nothing is stored', () => {
    expect(new GridLayoutStore().layout()).toBe('square');
  });

  it('honours a stored layout', () => {
    localStorage.setItem(GRID_LAYOUT_STORAGE_KEY, 'masonry');
    expect(new GridLayoutStore().layout()).toBe('masonry');
  });

  it('ignores a stored value it does not recognise', () => {
    localStorage.setItem(GRID_LAYOUT_STORAGE_KEY, 'mosaic');
    expect(new GridLayoutStore().layout()).toBe('square');
  });

  it('exposes the layout it is given', () => {
    const store = new GridLayoutStore();
    store.set('masonry');
    expect(store.layout()).toBe('masonry');
  });

  it('persists the layout it is given', () => {
    new GridLayoutStore().set('masonry');
    expect(localStorage.getItem(GRID_LAYOUT_STORAGE_KEY)).toBe('masonry');
  });

  it('falls back to square when reading storage throws', () => {
    spyOn(Storage.prototype, 'getItem').and.throwError('SecurityError');
    expect(new GridLayoutStore().layout()).toBe('square');
  });

  it('keeps the layout for this session when writing storage throws', () => {
    spyOn(Storage.prototype, 'setItem').and.throwError('QuotaExceededError');
    const store = new GridLayoutStore();
    store.set('masonry');
    expect(store.layout()).toBe('masonry');
  });
});
