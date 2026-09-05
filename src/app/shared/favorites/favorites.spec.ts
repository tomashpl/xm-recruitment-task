import { samplePhoto } from '../photos/picsum.test-data';
import {
  FAVORITES_STORAGE_KEY,
  favoriteMessage,
  parseFavorites,
  serializeFavorites,
} from './favorites';

describe('favorites storage', () => {
  it('names the storage key', () => {
    expect(FAVORITES_STORAGE_KEY).toBe('gallery.favorites');
  });

  it('reads an empty list when nothing is stored', () => {
    expect(parseFavorites(null)).toEqual([]);
    expect(parseFavorites('')).toEqual([]);
  });

  it('reads an empty list from malformed json', () => {
    expect(parseFavorites('{oops')).toEqual([]);
  });

  it('reads an empty list from a payload that is not an array', () => {
    expect(parseFavorites('{"id":"0"}')).toEqual([]);
  });

  it('keeps the valid records and drops the broken ones', () => {
    const valid = samplePhoto({ id: '7' });
    const raw = JSON.stringify([valid, { id: '8' }, null, { ...valid, width: 0 }]);
    expect(parseFavorites(raw)).toEqual([valid]);
  });

  it('drops a record whose field has the wrong type', () => {
    const valid = samplePhoto({ id: '7' });
    const raw = JSON.stringify([{ ...valid, width: '5000' }]);
    expect(parseFavorites(raw)).toEqual([]);
  });

  it('de-duplicates by id, keeping the first occurrence', () => {
    const first = samplePhoto({ id: '7', alt: 'first' });
    const duplicate = samplePhoto({ id: '7', alt: 'duplicate' });
    const other = samplePhoto({ id: '8' });
    const raw = JSON.stringify([first, duplicate, other]);
    expect(parseFavorites(raw)).toEqual([first, other]);
  });

  it('round-trips a list through storage', () => {
    const photos = [samplePhoto({ id: '1' }), samplePhoto({ id: '2' })];
    expect(parseFavorites(serializeFavorites(photos))).toEqual(photos);
  });

  it('words the message by direction', () => {
    const photo = samplePhoto({ alt: 'photo by Ada Lovelace' });
    expect(favoriteMessage(photo, true)).toBe('Added photo by Ada Lovelace to favorites');
    expect(favoriteMessage(photo, false)).toBe('Removed photo by Ada Lovelace from favorites');
  });
});
