# @gallery/ui

Domain-agnostic presentational primitives for the gallery application: `ui-badge`, `ui-button`,
`ui-empty-state`, `ui-icon`, `ui-icon-button`, `ui-loading-indicator`, `ui-section-heading`,
`ui-snackbar`, `ui-spinner`.

## Using it

The library is a workspace project, consumed through the `@gallery/ui` path mapping in the root
`tsconfig.json`. It is not published to npm.

A host must do four things:

1. Provide a Material 3 theme. The components read `--mat-sys-*` tokens and ship no theme of
   their own.
2. Load the library's global stylesheet, which carries the rules that have to outrank Angular
   Material's own and so cannot live inside a component:

   ```scss
   @use 'gallery-ui';

   @include gallery-ui.styles;
   ```

   resolved through `stylePreprocessorOptions.includePaths`, pointing at `projects/ui/src/styles`
   inside this workspace, or at `node_modules/@gallery/ui/styles` for a consumer of the built
   package — `ng-package.json` ships the stylesheet as an asset, so `dist/ui/styles/` carries it.
   The rules come as a mixin rather than bare declarations because they have to outrank Angular
   Material, so the host controls where in the cascade they land — include them last.
3. Register the providers once, in the application config:

   ```ts
   import { provideGalleryUi } from '@gallery/ui';

   export const appConfig: ApplicationConfig = {
     providers: [provideGalleryUi()],
   };
   ```

   `provideGalleryUi()` sets the Material icon registry's default font set to
   `material-symbols-outlined`, which `ui-icon` requires.
4. Load the Material Symbols Outlined webfont. `provideGalleryUi()` sets the font-set *class*; the
   font *file* is the host's job, and without it every icon renders as its ligature word
   (`favorite`, `arrow_back`, …). The application loads it from `index.html`:

   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zen+Tokyo+Zoo&family=Outfit:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap">
   ```

   Only the `Material+Symbols+Outlined` family is the library's requirement; the other families in
   that request are the application's own typography.

## Snackbar

`SnackbarComponent` is opened by the host through `MatSnackBar.openFromComponent`, and the panel it
lands in is styled by the `gallery-ui` mixin. The class that joins the two is exported so the host
does not have to repeat a string:

```ts
import { SNACKBAR_PANEL_CLASS, SnackbarComponent, SnackbarData } from '@gallery/ui';

snackBar.openFromComponent(SnackbarComponent, {
  data: { message: 'Saved' } satisfies SnackbarData,
  panelClass: SNACKBAR_PANEL_CLASS,
});
```

Passing a different `panelClass` opts out of the library's panel styling.

## Commands

| Task | Command |
| --- | --- |
| Build the library standalone | `ng build ui` |
| Tests, watch mode | `npm run test:ui` |
| Tests once, CI-style | `ng test ui --watch=false --browsers=ChromeHeadless` |
