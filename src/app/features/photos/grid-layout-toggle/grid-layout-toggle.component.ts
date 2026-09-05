import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '@gallery/ui';

import { GridLayout } from '../../../shared/preferences/grid-layout';

@Component({
  selector: 'app-grid-layout-toggle',
  imports: [IconComponent],
  templateUrl: './grid-layout-toggle.component.html',
  styleUrl: './grid-layout-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridLayoutToggleComponent {
  readonly layout = input.required<GridLayout>();

  readonly layoutChange = output<GridLayout>();
}
