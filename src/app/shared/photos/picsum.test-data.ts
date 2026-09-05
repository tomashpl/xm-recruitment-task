import { Photo } from '../../models/photo.model';
import { GRID_IMAGE_WIDTH, PAGE_SIZE, PICSUM_ORIGIN, PicsumPhotoDto, toPhoto } from './picsum';

export function picsumDto(overrides: Partial<PicsumPhotoDto> = {}): PicsumPhotoDto {
  return {
    id: '0',
    author: 'Alejandro Escamilla',
    width: 5000,
    height: 3333,
    url: 'https://unsplash.com/photos/yC-Yzbqy7PY',
    download_url: 'https://picsum.photos/id/0/5000/3333',
    ...overrides,
  };
}

export function picsumDtoList(count: number, startId = 0): readonly PicsumPhotoDto[] {
  return Array.from({ length: count }, (_unused, index) =>
    picsumDto({ id: String(startId + index), author: `Author ${startId + index}` }),
  );
}

export function picsumPageHeaders(nextPage: number | null): Record<string, string> {
  const page = nextPage ?? 1;
  const rel = nextPage === null ? 'prev' : 'next';

  return { Link: `<${PICSUM_ORIGIN}/v2/list?page=${page}&limit=${PAGE_SIZE}>; rel="${rel}"` };
}

export function samplePhoto(overrides: Partial<Photo> = {}): Photo {
  return { ...toPhoto(picsumDto(), GRID_IMAGE_WIDTH), ...overrides };
}
