import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MOCK_DETAIL_PHOTO } from '../../shared/fixtures/mock-photos';
import { ButtonComponent } from '../../ui/button/button.component';
import { RouteChipComponent } from '../../ui/route-chip/route-chip.component';
import { PhotoMetaComponent } from '../photos/photo-meta/photo-meta.component';
import { PhotoStageComponent } from '../photos/photo-stage/photo-stage.component';

@Component({
  selector: 'app-photo-detail-page',
  imports: [PhotoStageComponent, PhotoMetaComponent, RouteChipComponent, ButtonComponent],
  templateUrl: './photo-detail-page.component.html',
  styleUrl: './photo-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoDetailPageComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly photo = MOCK_DETAIL_PHOTO;
  protected readonly routePath = `/photos/${this.route.snapshot.paramMap.get('id') ?? ''}`;
}
