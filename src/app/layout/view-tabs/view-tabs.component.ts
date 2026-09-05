import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BadgeComponent } from '@gallery/ui';

import { TabLinkComponent } from '../tab-link/tab-link.component';

@Component({
  selector: 'app-view-tabs',
  imports: [TabLinkComponent, BadgeComponent],
  templateUrl: './view-tabs.component.html',
  styleUrl: './view-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewTabsComponent {
  readonly favoritesCount = input(0);
}
