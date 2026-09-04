import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { IconComponent } from '@gallery/ui';

export type IconButtonSize = 'md' | 'sm';

@Component({
  selector: 'app-icon-button',
  imports: [MatButtonModule, IconComponent],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButtonComponent {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly size = input<IconButtonSize>('md');

  readonly activate = output<void>();

  protected readonly iconSize = computed(() => (this.size() === 'sm' ? 20 : 24));
}
