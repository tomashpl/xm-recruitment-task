import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { IconComponent } from '../../ui/icon/icon.component';

@Component({
  selector: 'app-tab-link',
  imports: [RouterLink, RouterLinkActive, MatRippleModule, IconComponent],
  templateUrl: './tab-link.component.html',
  styleUrl: './tab-link.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabLinkComponent {
  readonly link = input.required<string>();
  readonly icon = input.required<string>();
  readonly activeIcon = input<string | undefined>(undefined);
  readonly label = input.required<string>();

  protected readonly active = signal(false);

  protected readonly currentIcon = computed(() =>
    this.active() ? (this.activeIcon() ?? this.icon()) : this.icon(),
  );

  protected setActive(isActive: boolean): void {
    this.active.set(isActive);
  }
}
