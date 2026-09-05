import { Location } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  EmptyStateComponent,
  IconButtonComponent,
  LoadingIndicatorComponent,
  SNACKBAR_PANEL_CLASS,
  SnackbarComponent,
  SnackbarData,
} from '@gallery/ui';

import { Photo } from '../../models/photo.model';
import { favoriteMessage } from '../../shared/favorites/favorites';
import { FavoritesStore } from '../../shared/favorites/favorites.store';
import { parsePhoto, photoInfoUrl } from '../../shared/photos/picsum';
import { PhotoMetaComponent } from '../photos/photo-meta/photo-meta.component';
import { PhotoStageComponent } from '../photos/photo-stage/photo-stage.component';

@Component({
  selector: 'app-photo-detail-page',
  imports: [
    RouterLink,
    PhotoStageComponent,
    PhotoMetaComponent,
    ButtonComponent,
    IconButtonComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
  ],
  templateUrl: './photo-detail-page.component.html',
  styleUrl: './photo-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoDetailPageComponent {
  private readonly location = inject(Location);
  private readonly snackBar = inject(MatSnackBar);
  private readonly favorites = inject(FavoritesStore);

  readonly id = input.required<string>();

  protected readonly photo = httpResource(() => photoInfoUrl(this.id()), { parse: parsePhoto });

  protected readonly notFound = computed(() => this.photo.statusCode() === 404);

  protected readonly author = computed(() =>
    this.photo.hasValue() ? this.photo.value().author : undefined,
  );

  protected readonly isFavorite = computed(() => this.favorites.isFavorite(this.id()));

  protected goBack(): void {
    this.location.back();
  }

  protected onToggleFavorite(photo: Photo): void {
    const added = this.favorites.toggle(photo);

    this.snackBar.openFromComponent(SnackbarComponent, {
      data: { message: favoriteMessage(photo, added) } satisfies SnackbarData,
      duration: 4000,
      panelClass: SNACKBAR_PANEL_CLASS,
    });
  }
}
