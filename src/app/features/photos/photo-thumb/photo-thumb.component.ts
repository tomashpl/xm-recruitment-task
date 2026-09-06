import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Photo } from '../../../models/photo.model';
import { photoSrcset } from '../../../shared/photos/picsum';
import { GRID_TILE_SIZES } from '../photo-grid/photo-grid.component';

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

  protected readonly sizes = GRID_TILE_SIZES;
  protected readonly srcset = computed(() => photoSrcset(this.photo()));
}
