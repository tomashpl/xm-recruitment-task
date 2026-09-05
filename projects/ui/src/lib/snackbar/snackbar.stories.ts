import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBar } from '@angular/material/snack-bar';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';

import { SNACKBAR_PANEL_CLASS, SnackbarComponent, type SnackbarData } from './snackbar.component';

@Component({
  selector: 'ui-snackbar-host',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SnackbarHostComponent {
  private readonly snackBar = inject(MatSnackBar);

  constructor() {
    this.snackBar.openFromComponent(SnackbarComponent, {
      data: inject<SnackbarData>(MAT_SNACK_BAR_DATA),
      panelClass: SNACKBAR_PANEL_CLASS,
    });

    inject(DestroyRef).onDestroy(() => this.snackBar.dismiss());
  }
}

const withData = (data: SnackbarData) =>
  applicationConfig({ providers: [{ provide: MAT_SNACK_BAR_DATA, useValue: data }] });

const meta: Meta<SnackbarHostComponent> = {
  title: 'Primitives/Snackbar',
  component: SnackbarHostComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The snackbar is opened through `MatSnackBar`, so these stories show the real ' +
          'container: its surface comes from the panel class, not from the component itself.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<SnackbarHostComponent>;

export const WithUndo: Story = {
  decorators: [
    withData({ message: 'Added photo by Ada Lovelace to favorites', actionLabel: 'Undo' }),
  ],
};

export const DefaultAction: Story = {
  decorators: [withData({ message: 'Added photo by Grace Hopper to favorites' })],
};
