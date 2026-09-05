import { Photo } from '../../models/photo.model';

export const MAX_PAGES = 40;
export const PICSUM_ORIGIN = 'https://picsum.photos';
export const PAGE_SIZE = 30;
export const GRID_IMAGE_WIDTH = 600;
export const DETAIL_IMAGE_WIDTH = 1200;
export const IMAGE_FORMAT = 'webp';

export interface PicsumPhotoDto {
  readonly id: string;
  readonly author: string;
  readonly width: number;
  readonly height: number;
  readonly url: string;
  readonly download_url: string;
}

export function photoListUrl(page: number, limit: number): string {
  return `${PICSUM_ORIGIN}/v2/list?page=${page}&limit=${limit}`;
}

export function hasNextPage(link: string | null | undefined): boolean {
  return !!link && link.split(',').some(part => /;\s*rel="next"/.test(part));
}

export function photoInfoUrl(id: string): string {
  return `${PICSUM_ORIGIN}/id/${id}/info`;
}

export function photoImageUrl(id: string, width: number, height: number): string {
  return `${PICSUM_ORIGIN}/id/${id}/${width}/${height}.${IMAGE_FORMAT}`;
}

export function scaledHeight(dto: PicsumPhotoDto, targetWidth: number): number {
  return Math.round((targetWidth * dto.height) / dto.width);
}

export function rescalePhoto(photo: Photo, targetWidth: number): Photo {
  if (photo.width === targetWidth) {
    return photo;
  }

  const height = Math.round((targetWidth * photo.height) / photo.width);

  return {
    ...photo,
    url: photoImageUrl(photo.id, targetWidth, height),
    width: targetWidth,
    height,
  };
}

export function toPhoto(dto: PicsumPhotoDto, targetWidth: number): Photo {
  const height = scaledHeight(dto, targetWidth);

  return {
    id: dto.id,
    url: photoImageUrl(dto.id, targetWidth, height),
    alt: `photo by ${dto.author}`,
    author: dto.author,
    width: targetWidth,
    height,
    downloadUrl: dto.download_url,
  };
}

export function parsePhoto(value: unknown): Photo {
  return toPhoto(asDto(value), DETAIL_IMAGE_WIDTH);
}

export function parsePhotoList(value: unknown): readonly Photo[] {
  if (!Array.isArray(value)) {
    throw new Error('Expected a list of photos');
  }

  return value.map(item => toPhoto(asDto(item), GRID_IMAGE_WIDTH));
}

function asDto(value: unknown): PicsumPhotoDto {
  const dto = value as PicsumPhotoDto | null;

  const valid =
    !!dto &&
    typeof dto.id === 'string' &&
    typeof dto.author === 'string' &&
    typeof dto.download_url === 'string' &&
    typeof dto.width === 'number' &&
    typeof dto.height === 'number' &&
    dto.width > 0 &&
    dto.height > 0;

  if (!valid) {
    throw new Error('Malformed photo payload');
  }

  return dto;
}
