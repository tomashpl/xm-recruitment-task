import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-loading-indicator',
  imports: [SpinnerComponent],
  templateUrl: './loading-indicator.component.html',
  styleUrl: './loading-indicator.component.scss',
  host: { role: 'status', 'aria-live': 'polite' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingIndicatorComponent {
  readonly message = input('Loading photos…');
}
