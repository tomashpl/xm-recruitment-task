import {
  ACCENT_BAND_HEIGHT,
  RIBBON_LIMIT,
  SAMPLE_STEP,
  accentMix,
  lerpHex,
  normalizeHex,
  ribbonAlpha,
  ribbonRows,
  ribbonShades,
  ribbonTime,
  sampleColumns,
} from './ribbons';

describe('ribbons', () => {
  describe('normalizeHex', () => {
    it('accepts a six digit hex token and lowercases it', () => {
      expect(normalizeHex('  #001B29 ')).toBe('#001b29');
    });

    it('rejects anything the shade maths cannot parse', () => {
      expect(normalizeHex('rgb(0, 27, 41)')).toBeNull();
      expect(normalizeHex('#abc')).toBeNull();
      expect(normalizeHex('')).toBeNull();
    });
  });

  describe('lerpHex', () => {
    it('returns the endpoints untouched', () => {
      expect(lerpHex('#001b29', '#fcbf49', 0)).toBe('#001b29');
      expect(lerpHex('#001b29', '#fcbf49', 1)).toBe('#fcbf49');
    });

    it('walks each channel halfway at the midpoint', () => {
      expect(lerpHex('#000000', '#ffffff', 0.5)).toBe('#808080');
    });
  });

  describe('ribbonShades', () => {
    it('produces one shade per thickness step', () => {
      expect(ribbonShades('#001b29').length).toBe(8);
    });

    it('walks the surface colour towards white, never past it', () => {
      const shades = ribbonShades('#000000');
      expect(shades[0]).toBe('#0a0a0a');
      expect(shades[5]).toBe('#4d4d4d');
      for (const shade of shades) expect(shade).toMatch(/^#[0-9a-f]{6}$/);
    });
  });

  describe('sampleColumns', () => {
    it('starts off screen and spans past the right edge', () => {
      const columns = sampleColumns(100);
      expect(columns[0]).toBe(-14);
      expect(columns[columns.length - 1]).toBeGreaterThanOrEqual(100);
      expect(columns[1] - columns[0]).toBe(SAMPLE_STEP);
    });

    it('still yields a usable strip for a hairline viewport', () => {
      expect(sampleColumns(1).length).toBeGreaterThan(1);
    });
  });

  describe('ribbonRows', () => {
    const columns = sampleColumns(400);

    it('stacks every ribbon flush against the one above it', () => {
      const rows = ribbonRows(columns, 600, ribbonTime(1234));

      for (let index = 1; index < rows.length; index++) {
        const previous = rows[index - 1];
        const bottom = previous.top[0] + previous.half[0] * 2;
        expect(rows[index].top[0]).toBeCloseTo(bottom, 10);
      }
    });

    it('stops once the stack has cleared the canvas', () => {
      const short = ribbonRows(columns, 200, ribbonTime(1234));
      const tall = ribbonRows(columns, 2000, ribbonTime(1234));

      expect(short.length).toBeLessThan(tall.length);
      expect(tall.length).toBeLessThanOrEqual(RIBBON_LIMIT);
      const last = short[short.length - 1];
      expect(Math.max(...last.top.map((top, k) => top + last.half[k] * 2))).toBeGreaterThan(200);
    });

    it('never exceeds the ribbon budget on an unreachable canvas', () => {
      expect(ribbonRows(columns, 1e9, ribbonTime(1234)).length).toBe(RIBBON_LIMIT);
    });

    it('breathes: the same ribbon has a different thickness at a later time', () => {
      const early = ribbonRows(columns, 600, ribbonTime(0))[0];
      const later = ribbonRows(columns, 600, ribbonTime(9000))[0];

      expect(later.half[0]).not.toBeCloseTo(early.half[0], 6);
    });

    it('returns nothing when there is no strip to sample', () => {
      expect(ribbonRows([], 600, 0)).toEqual([]);
    });
  });

  describe('accentMix', () => {
    it('leaves ribbons outside the band untinted', () => {
      expect(accentMix(100, 140)).toBe(0);
      expect(accentMix(140 + ACCENT_BAND_HEIGHT + 1, 140)).toBe(0);
    });

    it('peaks in the middle of the band and fades to nothing at both edges', () => {
      expect(accentMix(140, 140)).toBe(0);
      expect(accentMix(140 + ACCENT_BAND_HEIGHT / 2, 140)).toBeCloseTo(1, 10);
      expect(accentMix(140 + ACCENT_BAND_HEIGHT, 140)).toBeCloseTo(0, 10);
    });
  });

  describe('ribbonAlpha', () => {
    it('stays inside the opacity range the mock-up paints with', () => {
      for (let index = 0; index < 40; index++) {
        const alpha = ribbonAlpha(index, ribbonTime(index * 700));
        expect(alpha).toBeGreaterThanOrEqual(0.7);
        expect(alpha).toBeLessThanOrEqual(1);
      }
    });
  });
});
