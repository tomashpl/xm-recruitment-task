import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Location } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { HeaderComponent } from './layout/header/header.component';
import { SkipLinkComponent } from './layout/skip-link/skip-link.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SkipLinkComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: '/' },
  );

  protected readonly showBack = computed(() => this.url().startsWith('/photos/'));

  protected goBack(): void {
    this.location.back();
  }
}
