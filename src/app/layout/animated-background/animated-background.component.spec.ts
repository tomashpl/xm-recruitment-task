import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedBackgroundComponent } from './animated-background.component';

let scheduled = 0;

function countFrames(): void {
  scheduled = 0;
  const real = window.requestAnimationFrame.bind(window);
  spyOn(window, 'requestAnimationFrame').and.callFake((callback: FrameRequestCallback) => {
    scheduled++;
    return real(callback);
  });
}

function stubReducedMotion(reduce: boolean): void {
  const real = window.matchMedia.bind(window);
  spyOn(window, 'matchMedia').and.callFake((query: string) =>
    query.includes('prefers-reduced-motion')
      ? ({
          matches: reduce,
          media: query,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
        } as unknown as MediaQueryList)
      : real(query),
  );
}

function isBlank(canvas: HTMLCanvasElement): boolean {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('no 2d context');
  const x = Math.floor(canvas.width / 2);
  const y = Math.floor(canvas.height / 2);
  return context.getImageData(x, y, 1, 1).data[3] === 0;
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function framesOver(ms: number): Promise<number> {
  const before = scheduled;
  await wait(ms);
  return scheduled - before;
}

function setTabHidden(hidden: boolean): void {
  if (hidden) Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
  else Reflect.deleteProperty(document, 'hidden');
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('AnimatedBackgroundComponent', () => {
  let fixture: ComponentFixture<AnimatedBackgroundComponent>;

  async function render(): Promise<HTMLCanvasElement> {
    await TestBed.configureTestingModule({
      imports: [AnimatedBackgroundComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AnimatedBackgroundComponent);
    await fixture.whenStable();
    return fixture.nativeElement.querySelector('canvas');
  }

  afterEach(() => {
    Reflect.deleteProperty(document, 'hidden');
    fixture?.destroy();
  });

  it('hides both decorative layers from assistive technology', async () => {
    const canvas = await render();

    expect(canvas.getAttribute('aria-hidden')).toBe('true');
    expect(
      fixture.nativeElement.querySelector('.app-background__scrim').getAttribute('aria-hidden'),
    ).toBe('true');
  });

  it('sizes the backing store to the css box, without a retina multiplier', async () => {
    const canvas = await render();

    expect(canvas.clientWidth).toBeGreaterThan(0);
    expect(canvas.width).toBe(canvas.clientWidth);
    expect(canvas.height).toBe(canvas.clientHeight);
  });

  it('paints the ribbons across the canvas', async () => {
    const canvas = await render();

    expect(isBlank(canvas)).toBeFalse();
  });

  it('keeps driving frames while motion is welcome', async () => {
    stubReducedMotion(false);
    await render();
    countFrames();

    expect(await framesOver(200)).toBeGreaterThan(3);
  });

  it('parks the loop while the tab is hidden and picks it up on return', async () => {
    stubReducedMotion(false);
    await render();
    countFrames();

    setTabHidden(true);
    expect(await framesOver(150)).toBe(0);

    setTabHidden(false);
    expect(await framesOver(150)).toBeGreaterThan(3);
  });

  it('paints one frame and asks for no more under prefers-reduced-motion', async () => {
    stubReducedMotion(true);
    const canvas = await render();
    countFrames();

    expect(isBlank(canvas)).toBeFalse();
    expect(await framesOver(200)).toBe(0);
  });

  it('stops asking for frames once the shell tears the background down', async () => {
    stubReducedMotion(false);
    await render();
    countFrames();
    fixture.destroy();

    expect(await framesOver(200)).toBe(0);
  });
});
