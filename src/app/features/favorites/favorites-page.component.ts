import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Photo } from '../../models/photo.model';
import { MOCK_FAVORITES } from '../../shared/fixtures/mock-photos';
import { EmptyStateComponent } from '../../ui/empty-state/empty-state.component';
import { RouteChipComponent } from '../../ui/route-chip/route-chip.component';
import { SectionHeadingComponent } from '../../ui/section-heading/section-heading.component';
import { PhotoGridComponent } from '../photos/photo-grid/photo-grid.component';
import { PhotoTileComponent } from '../photos/photo-tile/photo-tile.component';

@Component({
  selector: 'app-favorites-page',
  imports: [
    RouterLink,
    SectionHeadingComponent,
    RouteChipComponent,
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
