import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { ButtonComponent, IconButtonComponent } from '@gallery/ui';

import { Photo } from '../../models/photo.model';
import { MOCK_DETAIL_PHOTO, MOCK_PHOTOS } from '../../shared/fixtures/mock-photos';
import { PhotoMetaComponent } from '../photos/photo-meta/photo-meta.component';
import { PhotoStageComponent } from '../photos/photo-stage/photo-stage.component';

@Component({
  selector: 'app-photo-detail-page',
  imports: [PhotoStageComponent, PhotoMetaComponent, ButtonComponent, IconButtonComponent],
  templateUrl: './photo-detail-page.component.html',
  styleUrl: './photo-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoDetailPageComponent {
  private readonly location = inject(Location);

  readonly id = input.required<string>();

  protected readonly photo = computed<Photo>(() => {
    const match = MOCK_PHOTOS.find(photo => photo.id === this.id());

    if (!match) {
      return MOCK_DETAIL_PHOTO;
    }

    return {
      id: match.id,
      url: match.url,
      alt: match.alt,
      author: MOCK_DETAIL_PHOTO.author,
      width: match.width,
      height: match.height,
      downloadUrl: MOCK_DETAIL_PHOTO.downloadUrl,
    };
  });

  protected goBack(): void {
    this.location.back();
  }
}
