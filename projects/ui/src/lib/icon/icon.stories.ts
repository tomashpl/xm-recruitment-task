import type { Meta, StoryObj } from '@storybook/angular';

import { IconComponent } from './icon.component';

const meta: Meta<IconComponent> = {
  title: 'Primitives/Icon',
  component: IconComponent,
  args: { name: 'favorite', filled: false, size: 24 },
  argTypes: {
    size: { control: { type: 'range', min: 16, max: 64, step: 4 } },
  },
};

export default meta;

type Story = StoryObj<IconComponent>;

export const Outlined: Story = {};

export const Filled: Story = { args: { filled: true } };

export const Large: Story = { args: { size: 48 } };

export const PhotoCamera: Story = { args: { name: 'photo_camera' } };
