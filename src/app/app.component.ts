import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AnimatedBackgroundComponent } from './layout/animated-background/animated-background.component';
import { HeaderComponent } from './layout/header/header.component';
import { SkipLinkComponent } from './layout/skip-link/skip-link.component';
import { FavoritesStore } from './shared/favorites/favorites.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SkipLinkComponent, HeaderComponent, AnimatedBackgroundComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly favorites = inject(FavoritesStore);
}
