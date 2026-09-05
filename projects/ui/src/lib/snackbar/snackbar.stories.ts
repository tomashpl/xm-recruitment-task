import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';

import { SnackbarComponent, type SnackbarData } from './snackbar.component';

const snackbarProviders = (data: SnackbarData) =>
  applicationConfig({
    providers: [
      { provide: MAT_SNACK_BAR_DATA, useValue: data },
      { provide: MatSnackBarRef, useValue: { dismissWithAction: () => undefined } },
    ],
  });

const meta: Meta<SnackbarComponent> = {
  title: 'Primitives/Snackbar',
  component: SnackbarComponent,
};

export default meta;

type Story = StoryObj<SnackbarComponent>;

export const WithUndo: Story = {
  decorators: [
    snackbarProviders({ message: 'Added photo by Ada Lovelace to favorites', actionLabel: 'Undo' }),
  ],
};

export const DefaultAction: Story = {
  decorators: [snackbarProviders({ message: 'Added photo by Grace Hopper to favorites' })],
};
