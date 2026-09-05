import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Photo } from '../../../models/photo.model';

@Component({
  selector: 'app-photo-thumb',
  templateUrl: './photo-thumb.component.html',
  styleUrl: './photo-thumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoThumbComponent {
  readonly photo = input.required<Photo>();
  readonly overlay = input(false);
  readonly priority = input(false);
}
