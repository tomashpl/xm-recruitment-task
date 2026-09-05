import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
import { PAGE_SIZE, parsePhotoList, photoListUrl } from '../../shared/photos/picsum';
import { PhotoGridComponent } from '../photos/photo-grid/photo-grid.component';
import { PhotoTileComponent } from '../photos/photo-tile/photo-tile.component';

@Component({
  selector: 'app-photo-stream-page',
  imports: [
    SectionHeadingComponent,
    PhotoGridComponent,
    PhotoTileComponent,
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

  protected readonly photos = httpResource(() => photoListUrl(1, PAGE_SIZE), {
    parse: parsePhotoList,
    defaultValue: [],
  });

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
}
