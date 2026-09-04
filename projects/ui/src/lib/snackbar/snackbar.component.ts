import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export interface SnackbarData {
  readonly message: string;
  readonly actionLabel?: string;
}

@Component({
  selector: 'ui-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnackbarComponent {
  private readonly ref = inject<MatSnackBarRef<SnackbarComponent>>(MatSnackBarRef);

  protected readonly data = inject<SnackbarData>(MAT_SNACK_BAR_DATA);

  protected get actionLabel(): string {
    return this.data.actionLabel ?? 'Dismiss';
  }

  protected dismissWithAction(): void {
    this.ref.dismissWithAction();
  }
}
