import type { Meta, StoryObj } from '@storybook/angular';

import { EmptyStateComponent } from './empty-state.component';

const meta: Meta<EmptyStateComponent> = {
  title: 'Primitives/Empty state',
  component: EmptyStateComponent,
  args: {
    icon: 'favorite_border',
    message: 'No favorites yet. Photos you tap in the photostream show up here.',
  },
};

export default meta;

type Story = StoryObj<EmptyStateComponent>;

export const Default: Story = {};

export const Offline: Story = {
  args: {
    icon: 'cloud_off',
    message: 'Could not load photos. Check your connection and try again.',
  },
};

export const WithAction: Story = {
  render: args => ({
    props: args,
    template: `
      <ui-empty-state [icon]="icon" [message]="message">
        <a href="#">Browse photos</a>
      </ui-empty-state>
    `,
  }),
};
