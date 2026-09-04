import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TitleComponent } from '../title/title.component';
import { ViewTabsComponent } from '../view-tabs/view-tabs.component';

@Component({
  selector: 'app-header',
  imports: [TitleComponent, ViewTabsComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly favoritesCount = input(0);
}
