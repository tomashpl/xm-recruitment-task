import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './layout/header/header.component';
import { SkipLinkComponent } from './layout/skip-link/skip-link.component';
import { FavoritesStore } from './shared/favorites/favorites.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SkipLinkComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly favorites = inject(FavoritesStore);
}
