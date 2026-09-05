import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideGalleryUi } from '@gallery/ui';

import {
  INTERSECTION_OBSERVER_FACTORY,
  IntersectionObserverFactory,
} from '../intersection-observer';
import { StreamSentinelComponent } from './stream-sentinel.component';

describe('StreamSentinelComponent', () => {
  let fixture: ComponentFixture<StreamSentinelComponent>;
  let observed: Element[];
  let disconnected: number;
  let fire: (isIntersecting: boolean) => void;
  let fireBatch: (states: boolean[]) => void;

  async function afterPaint(): Promise<void> {
    await new Promise<void>(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
  }

  const factory: IntersectionObserverFactory = callback => {
    fire = isIntersecting => {
      callback([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver);
    };

    fireBatch = states => {
      callback(
        states.map(isIntersecting => ({ isIntersecting }) as IntersectionObserverEntry),
        {} as IntersectionObserver,
      );
    };

    return {
      observe: (element: Element) => observed.push(element),
      unobserve: () => undefined,
      disconnect: () => disconnected++,
      takeRecords: () => [],
      root: null,
      rootMargin: '',
      thresholds: [],
    } as unknown as IntersectionObserver;
  };

  beforeEach(async () => {
    observed = [];
    disconnected = 0;

    await TestBed.configureTestingModule({
      imports: [StreamSentinelComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideGalleryUi(),
        { provide: INTERSECTION_OBSERVER_FACTORY, useValue: factory },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StreamSentinelComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await afterPaint();
  });

  it('observes its own host element', () => {
    expect(observed).toEqual([fixture.nativeElement as Element]);
  });

  it('starts out invisible', () => {
    expect(fixture.componentInstance.visible()).toBeFalse();
  });

  it('follows the observer into and out of the viewport', async () => {
    fire(true);
    await fixture.whenStable();
    expect(fixture.componentInstance.visible()).toBeTrue();

    fire(false);
    await fixture.whenStable();
    expect(fixture.componentInstance.visible()).toBeFalse();
  });

  it('takes the most recent entry when a batch arrives at once', async () => {
    fireBatch([true, false]);
    await fixture.whenStable();
    expect(fixture.componentInstance.visible()).toBeFalse();

    fireBatch([false, true]);
    await fixture.whenStable();
    expect(fixture.componentInstance.visible()).toBeTrue();
  });

  it('shows the loading indicator only while it is loading', async () => {
    expect(fixture.nativeElement.querySelector('ui-loading-indicator')).toBeNull();

    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('ui-loading-indicator')).not.toBeNull();
  });

  it('offers a load more button that is out of the way but reachable', () => {
    const button: HTMLElement = fixture.nativeElement.querySelector('ui-button');

    expect(button.classList).toContain('visually-hidden');
    expect(button.textContent).toContain('Load more');
  });

  it('emits when the load more button is pressed', () => {
    const emitted: number[] = [];
    fixture.componentInstance.activate.subscribe(() => emitted.push(1));

    fixture.nativeElement.querySelector('ui-button button').click();

    expect(emitted.length).toBe(1);
  });

  it('disconnects the observer when it is destroyed', () => {
    fixture.destroy();
    expect(disconnected).toBe(1);
  });
});
