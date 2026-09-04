import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { IconButtonComponent } from '../../ui/icon-button/icon-button.component';
import { TitleComponent } from '../title/title.component';
import { ViewTabsComponent } from '../view-tabs/view-tabs.component';

@Component({
  selector: 'app-header',
  imports: [TitleComponent, ViewTabsComponent, IconButtonComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly showBack = input(false);
  readonly favoritesCount = input(0);

  readonly back = output<void>();
}
