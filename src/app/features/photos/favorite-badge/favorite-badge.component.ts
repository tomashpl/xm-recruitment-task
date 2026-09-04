import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { IconComponent } from '../../../ui/icon/icon.component';

@Component({
  selector: 'app-favorite-badge',
  imports: [IconComponent],
  templateUrl: './favorite-badge.component.html',
  styleUrl: './favorite-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoriteBadgeComponent {
  readonly active = input(false);
  readonly size = input<'sm' | 'lg'>('sm');

  protected readonly iconName = computed(() => (this.active() ? 'favorite' : 'favorite_border'));
  protected readonly iconSize = computed(() => (this.size() === 'lg' ? 28 : 18));
}
