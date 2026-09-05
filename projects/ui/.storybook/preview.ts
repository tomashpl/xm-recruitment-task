import { applicationConfig, type Preview } from '@storybook/angular';

import { provideGalleryUi } from '../src/lib/provide-gallery-ui';

const preview: Preview = {
  decorators: [applicationConfig({ providers: [provideGalleryUi()] })],
  parameters: {
    controls: { expanded: true },
    layout: 'centered',
  },
};

export default preview;
