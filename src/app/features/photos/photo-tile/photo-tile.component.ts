import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Photo } from '../../../models/photo.model';
import { FavoriteBadgeComponent } from '../favorite-badge/favorite-badge.component';
import { PhotoThumbComponent } from '../photo-thumb/photo-thumb.component';

export type TileInteraction = 'toggle' | 'link';

@Component({
  selector: 'app-photo-tile',
  imports: [RouterLink, PhotoThumbComponent, FavoriteBadgeComponent],
  templateUrl: './photo-tile.component.html',
  styleUrl: './photo-tile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoTileComponent {
  readonly photo = input.required<Photo>();
  readonly favorite = input(false);
  readonly interaction = input<TileInteraction>('toggle');

  readonly activate = output<Photo>();

  protected readonly isLink = computed(() => this.interaction() === 'link');
  protected readonly detailLink = computed(() => ['/photos', this.photo().id]);

  protected readonly label = computed(() => {
    const alt = this.photo().alt;
    if (this.isLink()) {
      return `Open ${alt}`;
    }
    return this.favorite() ? `Remove ${alt} from favorites` : `Add ${alt} to favorites`;
  });
}
