describe('global theme', () => {
  const root = () => getComputedStyle(document.documentElement);

  it('pins the Material primary token to the mockup accent', () => {
    expect(root().getPropertyValue('--mat-sys-primary').trim().toLowerCase()).toContain('#fcbf49');
  });

  it('pins the Material surface token to the mockup background', () => {
    expect(root().getPropertyValue('--mat-sys-surface').trim().toLowerCase()).toContain('#001b29');
  });

  it('exposes the application tokens Material does not model', () => {
    expect(root().getPropertyValue('--app-photo-mat').trim().toLowerCase()).toBe('#00131d');
    expect(root().getPropertyValue('--app-tile').trim().toLowerCase()).toBe('#052e42');
    expect(root().getPropertyValue('--app-snack-action').trim().toLowerCase()).toBe('#a33a00');
  });
});
