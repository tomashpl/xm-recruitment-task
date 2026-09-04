import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyStateComponent, SectionHeadingComponent } from '@gallery/ui';

import { Photo } from '../../models/photo.model';
import { MOCK_FAVORITES } from '../../shared/fixtures/mock-photos';
import { PhotoGridComponent } from '../photos/photo-grid/photo-grid.component';
import { PhotoTileComponent } from '../photos/photo-tile/photo-tile.component';

@Component({
  selector: 'app-favorites-page',
  imports: [
    RouterLink,
    SectionHeadingComponent,
    PhotoGridComponent,
    PhotoTileComponent,
    EmptyStateComponent,
  ],
  templateUrl: './favorites-page.component.html',
  styleUrl: './favorites-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesPageComponent {
  protected readonly favorites = signal<readonly Photo[]>(MOCK_FAVORITES);
}
