import { InjectionToken } from '@angular/core';

export type IntersectionObserverFactory = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
) => IntersectionObserver;

export const INTERSECTION_OBSERVER_FACTORY = new InjectionToken<IntersectionObserverFactory>(
  'IntersectionObserverFactory',
  {
    providedIn: 'root',
    factory: () => (callback, options) => new IntersectionObserver(callback, options),
  },
);
