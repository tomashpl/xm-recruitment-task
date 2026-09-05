import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyStateComponent, SectionHeadingComponent } from '@gallery/ui';

@Component({
  selector: 'app-favorites-page',
  imports: [RouterLink, SectionHeadingComponent, EmptyStateComponent],
  templateUrl: './favorites-page.component.html',
  styleUrl: './favorites-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesPageComponent {}
