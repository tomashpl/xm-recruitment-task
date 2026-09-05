# Storybook for the ui library, and Playwright end-to-end tests

Date: 2026-09-05
Status: specified

## Goal

Give the workspace two things it does not have: a browsable catalogue of the
`@gallery/ui` primitives, and end-to-end coverage of the journeys a visitor actually
takes through the application. Today the only automated proof that the application
works is 34 Karma specs, every one of which renders a component in isolation with a
stubbed backend. Nothing exercises the real bundle, the real router, or the browser
APIs that the photostream leans on — `IntersectionObserver` for the sentinel,
`localStorage` for the layout preference, and scroll position across a navigation.

Storybook covers the library only. The photo-domain components and the routed pages
stay out of it; they depend on the store, the router and `httpResource`, and mocking
that in stories would duplicate what Playwright already does against the real
application.

## Verified facts about the repository

Established by inspection on 2026-09-05, not assumed.

| Fact               | Value                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| Base commit        | `fdf446a`, `main` and `origin/main` in agreement, no divergence                                         |
| Workspace          | two projects: application `gallery-template` (root), library `ui` (`projects/ui`)                       |
| Angular            | 22.1.5; TypeScript 6.0.3; zoneless (`provideZonelessChangeDetection`)                                   |
| Library targets    | `build` (`@angular/build:ng-packagr`), `test`, `lint` — **no browser build target**                     |
| Library components | 9: badge, button, empty-state, icon, icon-button, loading-indicator, section-heading, snackbar, spinner |
| Existing gates     | 7, in `ci.yml`: lint, format:check, depcruise, check:styles, test:all, build, `ng build ui`             |
| App build output   | `dist/gallery-template/browser/`                                                                        |
| Published URL      | `https://tomashpl.github.io/xm-recruitment-task/`                                                       |
| `docs/`            | gitignored; `context/` is not, and already holds the deployment design and plan                         |

Read from npm and from the published package rather than from memory:

| Fact                                      | Value                                                                                                                                                            |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@storybook/angular`                      | `10.6.0`                                                                                                                                                         |
| Its Angular peer range                    | `>=18.0.0 <23.0.0` — Angular 22.1.5 is inside it                                                                                                                 |
| Its TypeScript peer range                 | `^4.9.0 \|\| ^5.0.0 \|\| ^6.0.0` — TS 6.0.3 is inside it                                                                                                         |
| `zone.js` peer                            | listed in `peerDependenciesMeta` as **optional**                                                                                                                 |
| Required peers absent from this workspace | `@angular-devkit/build-angular`, `@angular/platform-browser-dynamic`                                                                                             |
| `start-storybook` builder schema          | `required: []` — **`browserTarget` is optional**; `styles`, `stylePreprocessorOptions`, `tsConfig`, `assets`, `experimentalZoneless` are all first-class options |
| `compodoc` builder option                 | defaults to **`true`**                                                                                                                                           |
| `@playwright/test`                        | `1.63.0`                                                                                                                                                         |

Facts about the application that shape the end-to-end tests:

- Paging is driven by the `Link` response header, not by a counter: `hasNextPage`
  looks for `rel="next"`, and `MAX_PAGES` (40) is a hard ceiling. A mock that omits
  the header stops the stream dead on page one.
- `PhotoStreamStore` retries a failed request automatically with delays
  `[1000, 2000, 4000]` ms before the error becomes final.
- The layout preference lives in `localStorage` under `gallery.grid-layout`, values
  `square` and `masonry`.
- Photostream tiles render with the default `interaction = 'toggle'`, so they are
  `<button aria-label="Add photo by … to favorites">` elements that open a snackbar.
  The `'link'` variant that routes to `/photos/:id` is **not used anywhere**, so the
  detail page is reachable only by URL.
- `projects/ui/src/test-styles.scss` already applies the Material 3 theme inside the
  library boundary, without reaching into `src/`.
- `projects/ui/tsconfig.lib.json` includes `src/**/*.ts` and excludes only
  `**/*.spec.ts`.

## Decisions

**Storybook belongs to the library project, not the application.** The `storybook`
and `build-storybook` targets go on the `ui` project and run as `ng run ui:storybook`.
The library has no browser build target to borrow options from, but the builder schema
makes `browserTarget` optional, so `styles`, `tsConfig` and `stylePreprocessorOptions`
are given directly. The alternatives were rejected: hanging the targets off
`gallery-template` would document the library through the application's styles and
command name, and a third `ui-docs` project would cost a tsconfig, a lint target and a
dependency-cruiser question for the sake of nine primitives.

**The `storybook` target carries `browserTarget: "ui:build"`; `build-storybook` does
not.** This is a deliberate asymmetry, not an oversight — do not "fix" it by adding or
removing the option to make the two targets match. `start-schema.json` declares no
`default` for `browserTarget`, so when the option is left out the dev-server preset
receives it as `undefined`, and `checkForLegacyBuildOptions()` throws
`SB_FRAMEWORK_ANGULAR_0001` before Storybook starts. A literal `null` is rejected by
the builder's own schema validation, so `undefined`-by-omission is not available as a
workaround either; `"ui:build"` is the only value that satisfies the schema and the
preset at once. It was measured to cause no ng-packagr side effect and no `tsConfig`
leak into the Storybook build, so it is harmless to `storybook` and simply unnecessary
on `build-storybook`, which never goes through that preset check.

**Storybook reuses `test-styles.scss` rather than introducing a stylesheet.** That
file already themes Material within the library, which is exactly what the stories
need and exactly what `check:styles` demands. Its name is now slightly narrow, but
renaming it would touch the Karma target for no functional gain.

**`compodoc: false` is explicit.** The option defaults to `true`, and compodoc is not
installed. Left implicit, the builder fails on first run.

**`experimentalZoneless: true`.** The application bootstraps zoneless and the library
components are all `OnPush` with signal inputs. Storybook supports this mode natively,
and `zone.js` is an optional peer, so nothing needs to pull the Zone runtime back in.

**Stories are excluded from the library build.** `tsconfig.lib.json` currently sweeps
in every `.ts` under `src/`, so `*.stories.ts` enters the TypeScript program for
`ng build ui` — a `pre-push` hook and a CI gate. This does not fail the build:
ng-packagr's dependency-declaration check, the one that would reject the
`@storybook/angular` import as neither a dependency nor a peer dependency, only walks
the module graph reachable from `public-api.ts`, and a story file is never imported
from there. `**/*.stories.ts` joins `**/*.spec.ts` in `exclude` anyway, to turn that
incidental guarantee — unreachable today — into a structural one that still holds if
a story is ever imported by mistake.

**End-to-end tests run against the production bundle, not the dev server.** The
`webServer` serves `dist/gallery-template/browser`, so the tests exercise the artefact
that reaches GitHub Pages, including lazy route chunks and optimisation. `ng serve`
would be faster to start and would miss exactly the class of defect that only appears
after a production build.

**The static server is ours, not a dependency.** `tools/serve-dist.mjs` is a
dependency-free Node server with an SPA fallback to `index.html`. The fallback is not
optional: without it a deep link to `/photos/:id` returns 404, and it mirrors the
`404.html` copy that `deploy.yml` already relies on. The file sits beside the existing
`tools/check-style-boundaries.mjs`.

**The build is not part of `webServer`.** `webServer` only serves. The `test:e2e`
script runs `ng build && playwright test`, and CI calls `playwright test` directly
after its existing build gate, so the application is never built twice in one run.

**picsum is mocked at the network boundary, and so are the fonts.** Route handlers
answer the list, info and image endpoints with deterministic payloads, and Google
Fonts requests are aborted. Blocking the font makes the run independent of a CDN;
the cost is that Material Symbols render as ligature text, which is why every
assertion targets roles and accessible names rather than glyphs.

**Chromium and WebKit, not Chromium alone.** WebKit is where `IntersectionObserver`
and scroll restoration are most temperamental, and both are load-bearing in the
photostream. The second engine roughly doubles end-to-end time in CI; the coverage is
worth it.

**Storybook ships in the application's Pages artefact.** `deploy.yml` builds it and
copies it to `dist/gallery-template/browser/storybook`, so one artefact and one
deployment carry both. GitHub Pages offers a single environment per repository, so
splitting them would mean juggling artefacts for no benefit.

**End-to-end tests do not join the `pre-push` hook.** A production build plus two
browser engines would turn every push into a multi-minute wait. They are a CI gate and
an explicit script.

## Architecture

### Storybook

```
projects/ui/.storybook/
  main.ts             framework @storybook/angular, stories ../src/lib/**/*.stories.ts,
                      addons: addon-docs, addon-a11y
  preview.ts          global applicationConfig decorator providing provideGalleryUi()
  preview-head.html   the Google Fonts link from src/index.html
projects/ui/tsconfig.storybook.json   extends tsconfig.lib.json, adds .storybook/**/*.ts
projects/ui/src/lib/<name>/<name>.stories.ts   one per component, nine in total
```

`angular.json`, project `ui`:

```
storybook        @storybook/angular:start-storybook
build-storybook  @storybook/angular:build-storybook
  configDir                 projects/ui/.storybook
  tsConfig                  projects/ui/tsconfig.storybook.json
  styles                    [projects/ui/src/test-styles.scss]
  stylePreprocessorOptions  includePaths [projects/ui/src/styles]
  experimentalZoneless      true
  compodoc                  false
  outputDir                 dist/storybook          (build-storybook only)
  port                      6006                    (storybook only)
```

Stories import their component by relative path. The dependency-cruiser rule
`no-library-self-alias` forbids reaching the component through `@gallery/ui`, which
resolves to `public-api.ts`.

Scripts: `storybook` → `ng run ui:storybook`; `build:storybook` → `ng run ui:build-storybook`.

### Playwright

```
playwright.config.ts        testDir e2e, projects chromium + webkit,
                            baseURL http://127.0.0.1:4300,
                            webServer node tools/serve-dist.mjs,
                            reuseExistingServer !CI, forbidOnly CI, retries 2 in CI,
                            trace on-first-retry
tools/serve-dist.mjs        static server over dist/gallery-template/browser,
                            SPA fallback to index.html,
                            listens on 4300, overridable through PORT
e2e/tsconfig.json           editor support only
e2e/support/picsum.ts       test fixture installing the route handlers
e2e/fixtures/photos.ts      deterministic DTO factory and Link header builder
e2e/*.spec.ts               six journey files
```

Route handlers:

| Pattern                                                 | Response                                                                                    |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `**/picsum.photos/v2/list*`                             | a deterministic page of DTOs, plus a `link` header carrying `rel="next"` while pages remain |
| `**/picsum.photos/id/*/info`                            | a single DTO                                                                                |
| `**/picsum.photos/id/*/*/*`                             | a 1×1 transparent PNG                                                                       |
| `**/fonts.googleapis.com/**`, `**/fonts.gstatic.com/**` | aborted                                                                                     |

The image stub is safe because masonry derives its ratios from the DTO's `width` and
`height`, never from the decoded image.

Journeys:

1. **photostream** — 30 tiles on load; reaching the sentinel appends page two to 60;
   once the mock drops `rel="next"`, the end note appears.
2. **grid-layout** — switching to masonry writes `gallery.grid-layout=masonry`, and a
   reload preserves it.
3. **scroll-restore** — scroll deep, leave via the Favorites tab, return through the
   "Browse photos" call to action; the accumulated pages and the scroll offset are
   both restored. This is the only route out and back that the UI actually offers,
   because tiles do not link to the detail page.
4. **photo-detail** — a direct visit to `/photos/:id` renders author and dimensions
   from the mocked `/info`; the retry control refetches after a failure.
5. **favorites** — the empty state and its call to action return to the stream, and
   the active tab is marked correctly. The tab badge's count is not asserted:
   `ViewTabsComponent.favoritesCount` is `input(0)` with no real source yet, so a
   count assertion would only prove a constant. That journey waits on favourites
   persistence.
6. **errors** — a persistent list failure survives the store's three automatic
   retries and settles on the fatal empty state; "Try again" against a healthy mock
   recovers the stream.

Scripts: `test:e2e` → `ng build && playwright test`; `test:e2e:ui` → `playwright test --ui`.

### CI and deployment

`ci.yml` grows from seven gates to nine. After **Build the application**:

```
Cache ~/.cache/ms-playwright, keyed on the resolved Playwright version
npx playwright install --with-deps chromium webkit
npx playwright test
upload playwright-report/ if the previous step failed
```

After **Build the ui library**: `npm run build:storybook`.

`deploy.yml`, in the `build` job after the application build:

```
npm run build:storybook
cp -r dist/storybook dist/gallery-template/browser/storybook
```

The upload and deploy jobs are unchanged. Storybook then lives at
`https://tomashpl.github.io/xm-recruitment-task/storybook/`.

## Effect on the existing gates

| Gate           | Effect                                                                                                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ng build ui`  | Unaffected either way. ng-packagr's dependency-declaration check only walks the graph reachable from `public-api.ts`, which never reaches a story file; the `tsconfig.lib.json` exclusion is a structural guarantee, not a fix for an observed failure. |
| `depcruise`    | Unchanged, provided stories import relatively; `no-library-self-alias` enforces it.                                                                                                                                                                     |
| `check:styles` | Unchanged. Storybook adds no stylesheet and consumes the library's existing themed entry.                                                                                                                                                               |
| `lint`         | Picks up `*.stories.ts`. `.storybook/` is skipped, because ESLint ignores dot directories by default. `e2e/**/*.ts` is added to the application's `lintFilePatterns`, which today stop at `src/`.                                                       |
| `format:check` | Covers every new file, including both workflows. `lint-staged` does not touch `.github/**`, so workflow YAML must be formatted by hand.                                                                                                                 |
| `test:all`     | Unchanged.                                                                                                                                                                                                                                              |
| `npm ci`       | Grows by Storybook's webpack stack; CI additionally downloads two browser engines, mitigated by the cache.                                                                                                                                              |

New `.gitignore` entries: `/test-results`, `/playwright-report`, `/blob-report`.
`dist/storybook` is already covered by the existing `/dist` entry.

## Risks to resolve empirically

- **Storybook under a subpath.** `build-storybook` is expected to emit relative asset
  URLs, which would make `/storybook/` work with no base-href flag. This is asserted,
  not verified; it must be checked against the built artefact before the deploy step
  is considered done.
- **The webpack peer stack.** `@angular-devkit/build-angular@22` and
  `@angular/platform-browser-dynamic@22` will be installed as peers of a workspace
  that otherwise runs on `@angular/build`. They are expected to coexist; if the
  install resolves into a conflict, the fallback is to pin them explicitly in
  `devDependencies`.
- **WebKit and the animated entries.** `animate.enter` on appended tiles may make
  WebKit assertions timing-sensitive. Assertions target counts and accessible names
  rather than opacity, and Playwright's auto-waiting should absorb the rest; if a
  spec proves flaky, the animation is disabled for the test run through a media
  preference rather than by loosening the assertion.
- **Sentinel visibility in a headless viewport.** The infinite-scroll journey depends
  on `IntersectionObserver` firing after a programmatic scroll. If it proves
  unreliable, the sentinel's own activate control is the deterministic fallback.

## Acceptance criteria

1. `npm run storybook` serves nine components locally, with icons and Material
   theming intact.
2. `npm run build:storybook` produces `dist/storybook` and exits zero.
3. `npm run test:e2e` passes on Chromium and WebKit from a clean checkout.
4. All seven existing gates still pass, `ng build ui` among them.
5. `ci.yml` runs nine gates; a deliberately broken journey turns the run red.
6. A deployment publishes the application at the site root and Storybook under
   `/storybook/`, both reachable.

## Out of scope

- Stories for photo-domain components or routed pages.
- Visual regression or screenshot comparison in Playwright.
- Component testing through Storybook's test runner.
- Any change to application behaviour. If a journey exposes a defect, it is recorded,
  not fixed here.
- Wiring the unused `interaction="link"` tile variant into the photostream. That
  belongs to the favourites feature.
