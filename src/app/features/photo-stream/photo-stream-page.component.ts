import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ButtonComponent,
  EmptyStateComponent,
  LoadingIndicatorComponent,
  SNACKBAR_PANEL_CLASS,
  SectionHeadingComponent,
  SnackbarComponent,
  SnackbarData,
} from '@gallery/ui';

import { Photo } from '../../models/photo.model';
import { PhotoStreamStore } from '../../shared/photos/photo-stream.store';
import { GridLayout, GridLayoutStore } from '../../shared/preferences/grid-layout';
import { GridLayoutToggleComponent } from '../photos/grid-layout-toggle/grid-layout-toggle.component';
import { PhotoGridComponent } from '../photos/photo-grid/photo-grid.component';
import { PhotoTileComponent } from '../photos/photo-tile/photo-tile.component';
import { StreamSentinelComponent } from '../photos/stream-sentinel/stream-sentinel.component';

@Component({
  selector: 'app-photo-stream-page',
  imports: [
    SectionHeadingComponent,
    GridLayoutToggleComponent,
    PhotoGridComponent,
    PhotoTileComponent,
    StreamSentinelComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    ButtonComponent,
  ],
  templateUrl: './photo-stream-page.component.html',
  styleUrl: './photo-stream-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoStreamPageComponent {
  private readonly snackBar = inject(MatSnackBar);
  private readonly gridLayout = inject(GridLayoutStore);
  private readonly sentinel = viewChild(StreamSentinelComponent);

  protected readonly store = inject(PhotoStreamStore);
  protected readonly layout = this.gridLayout.layout;
  private readonly scrollRestored = signal(true);

  constructor() {
    effect(() => this.fillViewport());
  }

  protected onLayoutChange(layout: GridLayout): void {
    this.gridLayout.set(layout);
  }

  protected onActivate(photo: Photo): void {
    this.snackBar.openFromComponent(SnackbarComponent, {
      data: {
        message: `Added ${photo.alt} to favorites`,
        actionLabel: 'Undo',
      } satisfies SnackbarData,
      duration: 4000,
      panelClass: SNACKBAR_PANEL_CLASS,
    });
  }

  private fillViewport(): void {
    if (this.scrollRestored() && this.sentinel()?.visible() && this.store.canLoadMore()) {
      this.store.loadNext();
    }
  }
}
