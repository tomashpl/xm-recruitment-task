import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';

import {
  ACCENT_BAND_OFFSET,
  RibbonRow,
  accentMix,
  lerpHex,
  normalizeHex,
  ribbonAlpha,
  ribbonRows,
  ribbonShades,
  ribbonTime,
  sampleColumns,
} from './ribbons';

const FRAME_INTERVAL_MS = 1000 / 30;
const FALLBACK_SURFACE = '#001b29';
const FALLBACK_ACCENT = '#fcbf49';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

@Component({
  selector: 'app-animated-background',
  templateUrl: './animated-background.component.html',
  styleUrl: './animated-background.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimatedBackgroundComponent {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private context: CanvasRenderingContext2D | null = null;
  private shades: string[] = ribbonShades(FALLBACK_SURFACE);
  private accent = FALLBACK_ACCENT;
  private columns: number[] = [];
  private width = 0;
  private height = 0;
  private frame = 0;
  private painted = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const canvas = this.canvas().nativeElement;
      this.readPalette();
      this.measure();

      const observer = new ResizeObserver(() => this.measure());
      observer.observe(canvas);
      document.addEventListener('visibilitychange', this.onVisibilityChange);

      if (this.prefersReducedMotion()) this.paint(performance.now());
      else this.start();

      destroyRef.onDestroy(() => {
        this.stop();
        observer.disconnect();
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
      });
    });
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia(REDUCED_MOTION).matches;
  }

  private readPalette(): void {
    const styles = getComputedStyle(document.documentElement);
    const surface = normalizeHex(styles.getPropertyValue('--mat-sys-surface')) ?? FALLBACK_SURFACE;
    this.shades = ribbonShades(surface);
    this.accent = normalizeHex(styles.getPropertyValue('--mat-sys-primary')) ?? FALLBACK_ACCENT;
  }

  private measure(): void {
    const canvas = this.canvas().nativeElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    if (width === this.width && height === this.height) return;

    this.width = width;
    this.height = height;
    canvas.width = width;
    canvas.height = height;
    this.context = canvas.getContext('2d');
    this.context?.setTransform(1, 0, 0, 1, 0, 0);
    this.columns = sampleColumns(width);

    if (!this.frame) this.paint(performance.now());
  }

  private start(): void {
    if (this.frame) return;
    this.painted = 0;
    this.frame = requestAnimationFrame(this.tick);
  }

  private stop(): void {
    if (!this.frame) return;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private readonly tick = (now: number): void => {
    this.frame = requestAnimationFrame(this.tick);
    if (now - this.painted < FRAME_INTERVAL_MS) return;
    this.painted = now;
    this.paint(now);
  };

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) this.stop();
    else if (!this.prefersReducedMotion()) this.start();
  };

  private paint(now: number): void {
    const context = this.context;
    if (!context || !this.columns.length) return;

    const time = ribbonTime(now);
    const banner = document.querySelector('[role="banner"]');
    const guard = (banner?.getBoundingClientRect().height ?? 0) + ACCENT_BAND_OFFSET;

    context.clearRect(0, 0, this.width, this.height);
    for (const [index, row] of ribbonRows(this.columns, this.height, time).entries()) {
      this.fill(context, row, index, time, guard);
    }
    context.globalAlpha = 1;
  }

  private fill(
    context: CanvasRenderingContext2D,
    row: RibbonRow,
    index: number,
    time: number,
    guard: number,
  ): void {
    const middle = this.columns.length >> 1;
    const mix = accentMix(row.top[middle] + row.half[middle], guard);
    const neutral = this.shades[index % this.shades.length];

    context.fillStyle = mix < 0.005 ? neutral : lerpHex(neutral, this.accent, Math.min(1, mix));
    context.globalAlpha = ribbonAlpha(index, time);
    context.beginPath();
    for (let k = 0; k < this.columns.length; k++) {
      if (k === 0) context.moveTo(this.columns[k], row.top[k]);
      else context.lineTo(this.columns[k], row.top[k]);
    }
    for (let k = this.columns.length - 1; k >= 0; k--) {
      context.lineTo(this.columns[k], row.top[k] + row.half[k] * 2);
    }
    context.closePath();
    context.fill();
  }
}
