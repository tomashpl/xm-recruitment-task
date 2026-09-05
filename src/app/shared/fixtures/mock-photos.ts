import { Photo } from '../../models/photo.model';

const SEEDS = [
  'ansel',
  'berlin',
  'coast',
  'dune',
  'ember',
  'fjord',
  'grove',
  'harbor',
  'inlet',
  'juniper',
  'kelp',
  'lagoon',
];

export const MOCK_PHOTOS: readonly Photo[] = SEEDS.map(seed => ({
  id: seed,
  url: `https://picsum.photos/seed/${seed}/600/600`,
  alt: `photo ${seed}`,
  author: 'Alejandro Escamilla',
  width: 600,
  height: 600,
  downloadUrl: `https://picsum.photos/seed/${seed}/5616/3744`,
}));

export const MOCK_FAVORITES: readonly Photo[] = MOCK_PHOTOS.slice(0, 5);

export const MOCK_DETAIL_PHOTO: Photo = {
  id: 'ansel',
  url: 'https://picsum.photos/seed/ansel/1200/1600',
  alt: 'photo ansel',
  author: 'Alejandro Escamilla',
  width: 1200,
  height: 1600,
  downloadUrl: 'https://picsum.photos/id/1/5616/3744',
};
