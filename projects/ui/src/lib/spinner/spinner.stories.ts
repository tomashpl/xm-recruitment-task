import type { Meta, StoryObj } from '@storybook/angular';

import { SpinnerComponent } from './spinner.component';

const meta: Meta<SpinnerComponent> = {
  title: 'Primitives/Spinner',
  component: SpinnerComponent,
  args: { diameter: 18 },
  argTypes: {
    diameter: { control: { type: 'range', min: 12, max: 64, step: 2 } },
  },
};

export default meta;

type Story = StoryObj<SpinnerComponent>;

export const Default: Story = {};

export const Large: Story = { args: { diameter: 48 } };
