import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ButtonComponent, LoadingIndicatorComponent } from '@gallery/ui';

import { INTERSECTION_OBSERVER_FACTORY } from '../intersection-observer';

export const SENTINEL_ROOT_MARGIN = '400px 0px';

@Component({
  selector: 'app-stream-sentinel',
  imports: [ButtonComponent, LoadingIndicatorComponent],
  templateUrl: './stream-sentinel.component.html',
  styleUrl: './stream-sentinel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StreamSentinelComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly createObserver = inject(INTERSECTION_OBSERVER_FACTORY);
  private readonly intersecting = signal(false);

  readonly loading = input(false);

  readonly activate = output<void>();

  readonly visible = this.intersecting.asReadonly();

  constructor() {
    afterNextRender(() => {
      const observer = this.createObserver(
        entries => this.intersecting.set(entries.some(entry => entry.isIntersecting)),
        { rootMargin: SENTINEL_ROOT_MARGIN },
      );

      observer.observe(this.host.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
