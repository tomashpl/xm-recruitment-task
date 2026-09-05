import type { Meta, StoryObj } from '@storybook/angular';

import { IconButtonComponent } from './icon-button.component';

const meta: Meta<IconButtonComponent> = {
  title: 'Primitives/Icon button',
  component: IconButtonComponent,
  argTypes: {
    size: { control: 'inline-radio', options: ['md', 'sm'] },
  },
  args: { icon: 'arrow_back', label: 'Go back', size: 'md' },
};

export default meta;

type Story = StoryObj<IconButtonComponent>;

export const Medium: Story = {};

export const Small: Story = { args: { size: 'sm' } };

export const Favorite: Story = { args: { icon: 'favorite', label: 'Add to favorites' } };
