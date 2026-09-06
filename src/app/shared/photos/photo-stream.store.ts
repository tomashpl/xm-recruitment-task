import { httpResource } from '@angular/common/http';
import {
  DestroyRef,
  Injectable,
  InjectionToken,
  ResourceStatus,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';

import { Photo } from '../../models/photo.model';
import { PAGE_SIZE, hasNextPage, parsePhotoList, photoListUrl } from './picsum';

export const PHOTO_STREAM_RETRY_DELAYS = new InjectionToken<readonly number[]>(
  'PhotoStreamRetryDelays',
  { providedIn: 'root', factory: () => [1000, 2000, 4000] },
);

interface PhotoBatch {
  readonly status: ResourceStatus;
  readonly photos: readonly Photo[];
}

const NO_PHOTOS: readonly Photo[] = [];

@Injectable({ providedIn: 'root' })
export class PhotoStreamStore {
  private readonly requestedPage = signal(1);
  private readonly offset = signal(0);
  private readonly retryDelays = inject(PHOTO_STREAM_RETRY_DELAYS);
  private readonly attempt = signal(0);
  private retryTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly response = httpResource(() => photoListUrl(this.requestedPage(), PAGE_SIZE), {
    parse: parsePhotoList,
    defaultValue: [],
  });

  private readonly batch = computed<PhotoBatch>(() => {
    const status = this.response.status();
    return { status, photos: status === 'resolved' ? this.response.value() : NO_PHOTOS };
  });

  private readonly accumulated = linkedSignal<PhotoBatch, readonly Photo[]>({
    source: this.batch,
    computation: (batch, previous) => {
      const kept = previous?.value ?? NO_PHOTOS;
      return batch.status === 'resolved' ? [...kept, ...batch.photos] : kept;
    },
  });

  private readonly lastBatchSize = linkedSignal<PhotoBatch, number>({
    source: this.batch,
    computation: (batch, previous) =>
      batch.status === 'resolved' ? batch.photos.length : (previous?.value ?? 0),
  });

  readonly photos = this.accumulated.asReadonly();
  readonly scrollOffset = this.offset.asReadonly();

  readonly hasMore = computed(
    () => this.lastBatchSize() > 0 && hasNextPage(this.response.headers()?.get('link')),
  );
  readonly canLoadMore = computed(() => this.response.status() === 'resolved' && this.hasMore());
  readonly isComplete = computed(() => this.response.status() === 'resolved' && !this.hasMore());
  readonly isLoadingFirstPage = computed(
    () => this.response.isLoading() && this.photos().length === 0,
  );
  readonly isLoadingMore = computed(() => this.response.isLoading() && this.photos().length > 0);
  readonly inlineError = computed(() => !!this.response.error() && this.photos().length > 0);
  readonly fatalError = computed(() => !!this.response.error() && this.photos().length === 0);

  constructor() {
    effect(() => this.scheduleRetry(this.response.status()));
    inject(DestroyRef).onDestroy(() => this.clearRetry());
  }

  loadNext(): void {
    if (this.canLoadMore()) {
      untracked(() => this.accumulated());
      this.requestedPage.update(page => page + 1);
    }
  }

  retry(): void {
    if (this.response.status() !== 'error') {
      return;
    }

    this.clearRetry();
    this.attempt.set(0);
    this.response.reload();
  }

  rememberScroll(offset: number): void {
    this.offset.set(offset);
  }

  private scheduleRetry(status: ResourceStatus): void {
    if (status === 'resolved') {
      untracked(() => this.attempt.set(0));
      return;
    }

    if (status !== 'error') {
      return;
    }

    const delay = this.retryDelays[untracked(() => this.attempt())];

    if (delay === undefined) {
      return;
    }

    untracked(() => this.attempt.update(count => count + 1));
    this.clearRetry();
    this.retryTimer = setTimeout(() => this.response.reload(), delay);
  }

  private clearRetry(): void {
    clearTimeout(this.retryTimer);
    this.retryTimer = undefined;
  }
}
