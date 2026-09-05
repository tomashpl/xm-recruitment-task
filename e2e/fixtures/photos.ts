export interface PicsumDto {
  readonly id: string;
  readonly author: string;
  readonly width: number;
  readonly height: number;
  readonly url: string;
  readonly download_url: string;
}

export const PAGE_SIZE = 30;
export const TOTAL_PAGES = 3;

const AUTHORS = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Barbara Liskov'];
const RATIOS: readonly (readonly [number, number])[] = [
  [1200, 800],
  [800, 1200],
  [1000, 1000],
  [1600, 900],
];

export function photoPage(page: number, limit: number = PAGE_SIZE): PicsumDto[] {
  return Array.from({ length: limit }, (_, index) => {
    const offset = (page - 1) * limit + index;
    const [width, height] = RATIOS[offset % RATIOS.length];

    return {
      id: String(offset),
      author: AUTHORS[offset % AUTHORS.length],
      width,
      height,
      url: `https://picsum.photos/id/${offset}`,
      download_url: `https://picsum.photos/id/${offset}/${width}/${height}`,
    };
  });
}

export function linkHeader(page: number, totalPages: number = TOTAL_PAGES): string {
  const parts = [`<https://picsum.photos/v2/list?page=1&limit=${PAGE_SIZE}>; rel="first"`];

  if (page < totalPages) {
    parts.push(`<https://picsum.photos/v2/list?page=${page + 1}&limit=${PAGE_SIZE}>; rel="next"`);
  }

  return parts.join(', ');
}
