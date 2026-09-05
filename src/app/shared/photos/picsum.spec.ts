import {
  DETAIL_IMAGE_WIDTH,
  GRID_IMAGE_WIDTH,
  PAGE_SIZE,
  parsePhoto,
  parsePhotoList,
  photoImageUrl,
  photoInfoUrl,
  photoListUrl,
  scaledHeight,
  toPhoto,
} from './picsum';
import { picsumDto, picsumDtoList } from './picsum.test-data';

describe('picsum', () => {
  it('builds a list url carrying the page and the limit', () => {
    expect(photoListUrl(1, PAGE_SIZE)).toBe('https://picsum.photos/v2/list?page=1&limit=30');
  });

  it('builds an info url from the photo id', () => {
    expect(photoInfoUrl('564')).toBe('https://picsum.photos/id/564/info');
  });

  it('builds an image url from the requested dimensions', () => {
    expect(photoImageUrl('564', 600, 400)).toBe('https://picsum.photos/id/564/600/400');
  });

  it('scales the height so the requested crop keeps the original ratio', () => {
    expect(scaledHeight(picsumDto({ width: 5000, height: 3333 }), 1200)).toBe(800);
    expect(scaledHeight(picsumDto({ width: 3333, height: 5000 }), 1200)).toBe(1800);
  });

  it('maps a dto onto the model at the requested width', () => {
    const photo = toPhoto(picsumDto({ id: '7', width: 4000, height: 3000 }), GRID_IMAGE_WIDTH);

    expect(photo.id).toBe('7');
    expect(photo.width).toBe(600);
    expect(photo.height).toBe(450);
    expect(photo.url).toBe('https://picsum.photos/id/7/600/450');
  });

  it('derives the alternative text from the author', () => {
    expect(toPhoto(picsumDto({ author: 'Ada Lovelace' }), GRID_IMAGE_WIDTH).alt).toBe(
      'photo by Ada Lovelace',
    );
  });

  it('never lets the unsplash page url reach the model', () => {
    const dto = picsumDto({ url: 'https://unsplash.com/photos/yC-Yzbqy7PY' });
    const photo = toPhoto(dto, GRID_IMAGE_WIDTH);

    expect(photo.url).not.toBe(dto.url);
    expect(photo.url.startsWith('https://picsum.photos/')).toBeTrue();
    expect(photo.downloadUrl).toBe(dto.download_url);
  });

  it('parses a list at the grid width and a single photo at the detail width', () => {
    const photos = parsePhotoList(picsumDtoList(3));

    expect(photos.length).toBe(3);
    expect(photos[0].width).toBe(GRID_IMAGE_WIDTH);
    expect(parsePhoto(picsumDto()).width).toBe(DETAIL_IMAGE_WIDTH);
  });

  it('rejects a body that is not a list of photos', () => {
    expect(() => parsePhotoList({ photos: [] })).toThrowError(/list of photos/);
    expect(() => parsePhotoList([{ id: '1' }])).toThrowError(/Malformed/);
  });

  it('rejects a photo with dimensions it cannot scale', () => {
    expect(() => parsePhoto(picsumDto({ width: 0 }))).toThrowError(/Malformed/);
    expect(() => parsePhoto(null)).toThrowError(/Malformed/);
  });
});
