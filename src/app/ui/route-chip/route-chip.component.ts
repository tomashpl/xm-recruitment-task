import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-route-chip',
  templateUrl: './route-chip.component.html',
  styleUrl: './route-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteChipComponent {
  readonly path = input.required<string>();
}
