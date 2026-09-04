import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconComponent } from '@gallery/ui';

@Component({
  selector: 'app-favorite-badge',
  imports: [IconComponent],
  templateUrl: './favorite-badge.component.html',
  styleUrl: './favorite-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoriteBadgeComponent {
  readonly active = input(false);
  readonly expanded = input(false);
}
