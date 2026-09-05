import type { Meta, StoryObj } from '@storybook/angular';

import { BadgeComponent } from './badge.component';

const meta: Meta<BadgeComponent> = {
  title: 'Primitives/Badge',
  component: BadgeComponent,
  args: { count: 3, active: false },
};

export default meta;

type Story = StoryObj<BadgeComponent>;

export const Default: Story = {};

export const Active: Story = { args: { active: true } };

export const Empty: Story = { args: { count: 0 } };

export const ThreeDigits: Story = { args: { count: 128, active: true } };
