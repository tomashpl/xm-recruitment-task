import type { Meta, StoryObj } from '@storybook/angular';

import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Primitives/Button',
  component: ButtonComponent,
  argTypes: {
    variant: { control: 'inline-radio', options: ['filled', 'tonal', 'danger'] },
  },
  args: { variant: 'filled', icon: undefined, label: undefined },
  render: args => ({
    props: args,
    template: `<ui-button [variant]="variant" [icon]="icon" [label]="label">Save to favorites</ui-button>`,
  }),
};

export default meta;

type Story = StoryObj<ButtonComponent>;

export const Filled: Story = {};

export const Tonal: Story = { args: { variant: 'tonal' } };

export const Danger: Story = { args: { variant: 'danger' } };

export const WithIcon: Story = { args: { icon: 'favorite' } };
