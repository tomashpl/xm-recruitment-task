import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { IconComponent } from '../icon/icon.component';

export type ButtonVariant = 'filled' | 'tonal' | 'danger';

@Component({
  selector: 'app-button',
  imports: [MatButtonModule, IconComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('filled');
  readonly icon = input<string | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);

  readonly activate = output<void>();

  protected readonly matVariant = computed(() => (this.variant() === 'tonal' ? 'tonal' : 'filled'));
}
