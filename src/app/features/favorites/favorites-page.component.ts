import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyStateComponent, SectionHeadingComponent } from '@gallery/ui';

import { FavoritesStore } from '../../shared/favorites/favorites.store';
import { GridLayout, GridLayoutStore } from '../../shared/preferences/grid-layout';
import { GridLayoutToggleComponent } from '../photos/grid-layout-toggle/grid-layout-toggle.component';
import { PhotoGridComponent } from '../photos/photo-grid/photo-grid.component';
import { PhotoTileComponent } from '../photos/photo-tile/photo-tile.component';

@Component({
  selector: 'app-favorites-page',
  imports: [
    RouterLink,
    SectionHeadingComponent,
    EmptyStateComponent,
    GridLayoutToggleComponent,
    PhotoGridComponent,
    PhotoTileComponent,
  ],
  templateUrl: './favorites-page.component.html',
  styleUrl: './favorites-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesPageComponent {
  private readonly gridLayout = inject(GridLayoutStore);

  protected readonly favorites = inject(FavoritesStore);
  protected readonly layout = this.gridLayout.layout;

  protected onLayoutChange(layout: GridLayout): void {
    this.gridLayout.set(layout);
  }
}
