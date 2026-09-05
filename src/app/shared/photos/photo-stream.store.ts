import { httpResource } from '@angular/common/http';
import {
  Injectable,
  InjectionToken,
  ResourceStatus,
  computed,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';

import { Photo } from '../../models/photo.model';
import { MAX_PAGES, PAGE_SIZE, hasNextPage, parsePhotoList, photoListUrl } from './picsum';

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

  private readonly response = httpResource(() => photoListUrl(this.requestedPage(), PAGE_SIZE), {
    parse: parsePhotoList,
    defaultValue: [],
  });

  private readonly accumulated = linkedSignal<PhotoBatch, readonly Photo[]>({
    source: () => {
      const status = this.response.status();
      return { status, photos: status === 'resolved' ? this.response.value() : NO_PHOTOS };
    },
    computation: (batch, previous) => {
      const kept = previous?.value ?? NO_PHOTOS;
      return batch.status === 'resolved' ? [...kept, ...batch.photos] : kept;
    },
  });

  readonly photos = this.accumulated.asReadonly();
  readonly scrollOffset = this.offset.asReadonly();

  readonly hasMore = computed(
    () => this.requestedPage() < MAX_PAGES && hasNextPage(this.response.headers()?.get('link')),
  );
  readonly canLoadMore = computed(() => this.response.status() === 'resolved' && this.hasMore());
  readonly isComplete = computed(() => this.response.status() === 'resolved' && !this.hasMore());
  readonly isLoadingFirstPage = computed(
    () => this.response.isLoading() && this.photos().length === 0,
  );
  readonly isLoadingMore = computed(() => this.response.isLoading() && this.photos().length > 0);
  readonly inlineError = computed(() => !!this.response.error() && this.photos().length > 0);
  readonly fatalError = computed(() => !!this.response.error() && this.photos().length === 0);

  loadNext(): void {
    if (this.canLoadMore()) {
      untracked(() => this.accumulated());
      this.requestedPage.update(page => page + 1);
    }
  }

  retry(): void {
    this.response.reload();
  }

  rememberScroll(offset: number): void {
    this.offset.set(offset);
  }
}
