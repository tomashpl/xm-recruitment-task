# @gallery/ui

Domain-agnostic presentational primitives for the gallery application: `ui-badge`, `ui-button`,
`ui-empty-state`, `ui-icon`, `ui-icon-button`, `ui-loading-indicator`, `ui-section-heading`,
`ui-snackbar`, `ui-spinner`.

## Using it

The library is a workspace project, consumed through the `@gallery/ui` path mapping in the root
`tsconfig.json`. It is not published to npm.

A host must do two things:

1. Provide a Material 3 theme. The components read `--mat-sys-*` tokens and ship no theme of
   their own.
2. Load the library's global stylesheet, which carries the rules that have to outrank Angular
   Material's own and so cannot live inside a component:

   ```scss
   @use 'gallery-ui';

   @include gallery-ui.styles;
   ```

   resolved through `stylePreprocessorOptions.includePaths: ["projects/ui/src/styles"]`. The rules
   come as a mixin rather than bare declarations because they have to outrank Angular Material,
   so the host controls where in the cascade they land — include them last.

Register the providers once, in the application config:

```ts
import { provideGalleryUi } from '@gallery/ui';

export const appConfig: ApplicationConfig = {
  providers: [provideGalleryUi()],
};
```

`provideGalleryUi()` sets the Material icon registry's default font set to
`material-symbols-outlined`, which `ui-icon` requires.

## Commands

| Task | Command |
| --- | --- |
| Build the library standalone | `ng build ui` |
| Tests, watch mode | `npm run test:ui` |
| Tests once, CI-style | `ng test ui --watch=false --browsers=ChromeHeadless` |
