import { Photo } from '../../models/photo.model';

export const FAVORITES_STORAGE_KEY = 'gallery.favorites';

export function parseFavorites(raw: string | null): readonly Photo[] {
  if (!raw) {
    return [];
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  return Array.isArray(parsed) ? parsed.filter(isPhoto) : [];
}

export function serializeFavorites(photos: readonly Photo[]): string {
  return JSON.stringify(photos);
}

export function favoriteMessage(photo: Photo, added: boolean): string {
  return added ? `Added ${photo.alt} to favorites` : `Removed ${photo.alt} from favorites`;
}

function isPhoto(value: unknown): value is Photo {
  const photo = value as Photo | null;

  return (
    !!photo &&
    typeof photo.id === 'string' &&
    photo.id.length > 0 &&
    typeof photo.url === 'string' &&
    typeof photo.alt === 'string' &&
    typeof photo.author === 'string' &&
    typeof photo.downloadUrl === 'string' &&
    typeof photo.width === 'number' &&
    typeof photo.height === 'number' &&
    photo.width > 0 &&
    photo.height > 0
  );
}
