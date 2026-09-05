import type { Meta, StoryObj } from '@storybook/angular';

import { SectionHeadingComponent } from './section-heading.component';

const meta: Meta<SectionHeadingComponent> = {
  title: 'Primitives/Section heading',
  component: SectionHeadingComponent,
  args: {
    heading: 'Random photostream',
    hint: 'tap a photo to save it to favorites',
    headingId: 'stream-heading',
  },
};

export default meta;

type Story = StoryObj<SectionHeadingComponent>;

export const WithHint: Story = {};

export const HeadingOnly: Story = { args: { hint: undefined } };
