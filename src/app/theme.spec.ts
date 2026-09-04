describe('global theme', () => {
  const root = () => getComputedStyle(document.documentElement);

  const materialTokens: Record<string, string> = {
    'primary': '#fcbf49',
    'on-primary': '#002133',
    'surface': '#001b29',
    'surface-container': '#003049',
    'on-surface': '#eae2b7',
    'on-surface-variant': '#b4c4cd',
    'outline': '#4e6c80',
    'secondary-container': '#08405d',
    'on-secondary-container': '#fcbf49',
    'error': '#ff7a6b',
    'on-error': '#2b0700',
    'inverse-surface': '#eae2b7',
    'inverse-on-surface': '#00263a',
  };

  for (const [token, value] of Object.entries(materialTokens)) {
    it(`pins the Material ${token} token to the mockup value`, () => {
      expect(root().getPropertyValue(`--mat-sys-${token}`).trim().toLowerCase()).toContain(value);
    });
  }

  it('themes the scrollbar and reserves its gutter so a growing page never reflows the grid', () => {
    expect(root().scrollbarWidth).toBe('thin');
    expect(root().scrollbarGutter).toBe('stable');
    expect(root().scrollbarColor).not.toBe('auto');
    expect(root().scrollbarColor).toContain('rgb(252, 191, 73)');
  });

  it('exposes the application tokens Material does not model', () => {
    expect(root().getPropertyValue('--app-photo-mat').trim().toLowerCase()).toBe('#00131d');
    expect(root().getPropertyValue('--app-tile').trim().toLowerCase()).toBe('#052e42');
    expect(root().getPropertyValue('--app-snack-action').trim().toLowerCase()).toBe('#a33a00');
  });
});
