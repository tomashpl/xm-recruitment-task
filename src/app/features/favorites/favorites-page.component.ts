import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-favorites-page',
  template: '<h2>Favorites</h2>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesPageComponent {}
