import type { Meta, StoryObj } from '@storybook/angular';

import { LoadingIndicatorComponent } from './loading-indicator.component';

const meta: Meta<LoadingIndicatorComponent> = {
  title: 'Primitives/Loading indicator',
  component: LoadingIndicatorComponent,
  args: { message: 'Loading photos…' },
};

export default meta;

type Story = StoryObj<LoadingIndicatorComponent>;

export const Default: Story = {};

export const LoadingMore: Story = { args: { message: 'Loading more photos…' } };
