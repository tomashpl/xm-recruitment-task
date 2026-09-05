import { Location } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  EmptyStateComponent,
  IconButtonComponent,
  LoadingIndicatorComponent,
} from '@gallery/ui';

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

  readonly id = input.required<string>();

  protected readonly photo = httpResource(() => photoInfoUrl(this.id()), { parse: parsePhoto });

  protected readonly notFound = computed(() => this.photo.statusCode() === 404);

  protected goBack(): void {
    this.location.back();
  }
}
