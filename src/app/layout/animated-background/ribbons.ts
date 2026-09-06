export interface RibbonRow {
  readonly top: number[];
  readonly half: number[];
}

export const RIBBON_LIMIT = 200;
export const SAMPLE_STEP = 14;
export const SAMPLE_MARGIN = 14;
export const ACCENT_BAND_OFFSET = 56;
export const ACCENT_BAND_HEIGHT = 300;
export const TIME_SCALE = 22000;

const WAVE_AMPLITUDE = 9;
const OVERFLOW_SLACK = 40;
const BASE_THICKNESS = [11, 22, 15, 30, 12, 25, 40, 18];
const SHADE_STEPS = [0.04, 0.13, 0.07, 0.22, 0.1, 0.3, 0.16, 0.26];
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function normalizeHex(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  return HEX_COLOR.test(trimmed) ? trimmed : null;
}

function toChannels(hex: string): number[] {
  const packed = parseInt(hex.slice(1), 16);
  return [(packed >> 16) & 255, (packed >> 8) & 255, packed & 255];
}

function toHex(channels: number[]): string {
  return `#${channels.map(value => Math.round(value).toString(16).padStart(2, '0')).join('')}`;
}

export function lerpHex(from: string, to: string, amount: number): string {
  const start = toChannels(from);
  const end = toChannels(to);
  return toHex(start.map((value, index) => value + (end[index] - value) * amount));
}

export function ribbonShades(surface: string): string[] {
  const channels = toChannels(surface);
  return SHADE_STEPS.map(amount => toHex(channels.map(value => value + (255 - value) * amount)));
}

export function sampleColumns(width: number): number[] {
  const columns: number[] = [];
  for (let x = -SAMPLE_MARGIN; x <= width + SAMPLE_MARGIN; x += SAMPLE_STEP) columns.push(x);
  return columns;
}

export function ribbonTime(now: number): number {
  return now / TIME_SCALE;
}

export function ribbonRows(columns: number[], height: number, time: number): RibbonRow[] {
  if (!columns.length) return [];

  const edge = columns.map(
    x =>
      Math.sin(x * 0.0125 + time * 2) * WAVE_AMPLITUDE +
      Math.sin(x * 0.005 - time * 1.3) * WAVE_AMPLITUDE * 0.45 -
      WAVE_AMPLITUDE * 1.6,
  );
  const rows: RibbonRow[] = [];

  for (let index = 0; index < RIBBON_LIMIT; index++) {
    const base =
      BASE_THICKNESS[index % BASE_THICKNESS.length] *
      (1 + (0.38 * (Math.sin(time * 3.1 + index * 0.55) + 1)) / 2);
    const frequency = 0.006 + 0.005 * ((index % 5) / 5);
    const phase = index * 1.7 + time * 2.4;
    const half = columns.map(
      x => (base * (0.72 + 1.15 * Math.pow((Math.sin(x * frequency + phase) + 1) / 2, 1.5))) / 2,
    );
    const top = edge.slice();
    let lowest = -Infinity;

    for (let k = 0; k < columns.length; k++) {
      const bottom = top[k] + half[k] * 2;
      edge[k] = bottom;
      if (bottom > lowest) lowest = bottom;
    }

    rows.push({ top, half });
    if (lowest > height + OVERFLOW_SLACK) break;
  }

  return rows;
}

export function accentMix(centre: number, guard: number): number {
  const relative = (centre - guard) / ACCENT_BAND_HEIGHT;
  if (relative < 0 || relative > 1) return 0;
  return 0.5 - 0.5 * Math.cos(2 * Math.PI * relative);
}

export function ribbonAlpha(index: number, time: number): number {
  return 0.7 + 0.3 * Math.abs(Math.sin(index * 0.23 + time * 0.6));
}
