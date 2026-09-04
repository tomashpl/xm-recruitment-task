import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Photo } from '../../../models/photo.model';

@Component({
  selector: 'app-photo-stage',
  templateUrl: './photo-stage.component.html',
  styleUrl: './photo-stage.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoStageComponent {
  readonly photo = input.required<Photo>();
}
