# Storybook and Playwright tooling implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the workspace a Storybook catalogue of the nine `@gallery/ui` primitives and Playwright coverage of the six journeys a visitor takes through the application, both enforced in CI, with Storybook published alongside the application on GitHub Pages.

**Architecture:** Storybook attaches to the `ui` library project through `@storybook/angular`'s own builder, configured without a `browserTarget` because the library has no browser build. Playwright drives the production bundle behind a dependency-free static server, with picsum answered by route handlers so no test touches the network. Both become gates in `ci.yml`, taking it from seven to nine, and `deploy.yml` copies the built Storybook into the Pages artefact.

**Tech Stack:** Angular 22.1.5 (standalone, zoneless), TypeScript 6.0.3, `storybook` + `@storybook/angular` 10.6.0, `@playwright/test` 1.63.0, Node 24 in CI.

**Spec:** `context/tooling/2026-09-05-playwright-storybook-design.md`

## Global Constraints

- Commit messages are English, in the form `(type): Message` — `(feature)`, `(fix)`, `(chore)`, `(test)`, `(docs)`. No AI attribution trailers of any kind.
- Code carries no explanatory comments. Names are English. JSDoc only where an exported contract is genuinely unobvious.
- All user-facing copy is English.
- Selector prefixes are enforced by the linter: `ui-` inside `projects/ui`, `app-` inside `src`.
- Inside `projects/ui`, never import through `@gallery/ui`; use relative paths. The dependency-cruiser rule `no-library-self-alias` fails the commit otherwise.
- `projects/ui` must never import from `src/`.
- Every commit passes the `pre-commit` gates: `lint-staged`, `npm run depcruise`, `npm run check:styles`. Prettier runs automatically over staged files; `.github/**` is **not** covered by `lint-staged`, so workflow YAML must be formatted with `npx prettier --write` by hand before staging.
- `npm run test:all` and `npx ng build ui` run on `pre-push` and must stay green. Do **not** add the end-to-end tests to that hook; a production build plus two browser engines would make every push a multi-minute wait. They are a CI gate and an explicit script. No file under `.husky/` is modified by this plan.
- A Karma run prints `TOTAL: <n> SUCCESS` and then `ERROR: Some of your tests did a full page reload!`. Judge the run by `TOTAL:` and the exit code, not by that trailing line.
- Component stylesheets are budgeted at 2 kB warning / 4 kB error. Nothing in this plan adds component styles.

## File structure

**Created**

| Path                                           | Responsibility                                              |
| ---------------------------------------------- | ----------------------------------------------------------- |
| `projects/ui/.storybook/main.ts`               | Storybook framework, story glob, addon list                 |
| `projects/ui/.storybook/preview.ts`            | Global decorator supplying `provideGalleryUi()`             |
| `projects/ui/.storybook/preview-head.html`     | The Google Fonts link the icons and typography need         |
| `projects/ui/tsconfig.storybook.json`          | TypeScript config covering stories and `.storybook`         |
| `projects/ui/src/lib/<name>/<name>.stories.ts` | One story file per component, nine in total                 |
| `tools/serve-dist.mjs`                         | Static server over the built application, with SPA fallback |
| `playwright.config.ts`                         | Playwright projects, `webServer`, reporters                 |
| `e2e/tsconfig.json`                            | Editor support for the end-to-end sources                   |
| `e2e/fixtures/photos.ts`                       | Deterministic picsum DTOs and `Link` header builder         |
| `e2e/support/picsum.ts`                        | The `test` fixture that installs every route handler        |
| `e2e/*.spec.ts`                                | Six journey files                                           |
| `context/tooling/…-plan.md`                    | This document                                               |

**Modified**

| Path                            | Change                                                                      |
| ------------------------------- | --------------------------------------------------------------------------- |
| `package.json`                  | Storybook, Playwright and Node-types dev dependencies; four scripts         |
| `angular.json`                  | Two targets on `ui`; `e2e/**/*.ts` added to the application's lint patterns |
| `projects/ui/tsconfig.lib.json` | Exclude `**/*.stories.ts`                                                   |
| `tsconfig.json`                 | Reference the new Storybook config                                          |
| `.gitignore`                    | Playwright output directories                                               |
| `.github/workflows/ci.yml`      | Two new gates                                                               |
| `.github/workflows/deploy.yml`  | Build and copy Storybook into the Pages artefact                            |

---

# Phase A — Storybook

### Task 1: Storybook infrastructure and the first story

The library build is the thing most likely to break here, so this task proves the breakage before fixing it.

**Files:**

- Modify: `package.json`
- Create: `projects/ui/src/lib/button/button.stories.ts`
- Modify: `projects/ui/tsconfig.lib.json`
- Create: `projects/ui/tsconfig.storybook.json`
- Modify: `tsconfig.json`
- Create: `projects/ui/.storybook/main.ts`, `projects/ui/.storybook/preview.ts`, `projects/ui/.storybook/preview-head.html`
- Modify: `angular.json`

**Interfaces:**

- Consumes: nothing.
- Produces: the `ui:storybook` and `ui:build-storybook` targets; the `storybook` and `build:storybook` npm scripts; the story file convention that Tasks 2–4 follow — `const meta: Meta<X>` with `component`, `title`, `args`, exported as default, and named `StoryObj<X>` exports.

- [ ] **Step 1: Install Storybook**

```bash
npm install --save-dev storybook@^10.6.0 @storybook/angular@^10.6.0
```

npm will also pull the required peers `@angular-devkit/build-angular` and `@angular/platform-browser-dynamic`. That is expected — the spec accounts for the webpack stack. If npm reports a peer conflict instead of resolving, add `@angular-devkit/build-angular@^22.1.7` and `@angular/platform-browser-dynamic@^22.1.5` to `devDependencies` explicitly and reinstall.

- [ ] **Step 2: Write the first story**

Create `projects/ui/src/lib/button/button.stories.ts`. Note the relative import — `@gallery/ui` is forbidden inside the library.

```ts
import type { Meta, StoryObj } from '@storybook/angular';

import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Primitives/Button',
  component: ButtonComponent,
  argTypes: {
    variant: { control: 'inline-radio', options: ['filled', 'tonal', 'danger'] },
  },
  args: { variant: 'filled', icon: undefined, label: undefined },
  render: args => ({
    props: args,
    template: `<ui-button [variant]="variant" [icon]="icon" [label]="label">Save to favorites</ui-button>`,
  }),
};

export default meta;

type Story = StoryObj<ButtonComponent>;

export const Filled: Story = {};

export const Tonal: Story = { args: { variant: 'tonal' } };

export const Danger: Story = { args: { variant: 'danger' } };

export const WithIcon: Story = { args: { icon: 'favorite' } };
```

- [ ] **Step 3: Run the library build and watch it fail**

Run: `npx ng build ui`

Expected: FAIL. `projects/ui/package.json` declares only `@angular/core`, `@angular/material` and `tslib`, so ng-packagr rejects the `@storybook/angular` import as neither a dependency nor a peer dependency. This is the failure the spec predicted; it proves stories must leave the library build.

- [ ] **Step 4: Exclude stories from the library build**

In `projects/ui/tsconfig.lib.json`, change the `exclude` line:

```json
  "exclude": ["**/*.spec.ts", "**/*.stories.ts"]
```

- [ ] **Step 5: Run the library build and watch it pass**

Run: `npx ng build ui`

Expected: PASS, exit code 0.

- [ ] **Step 6: Add the Storybook TypeScript config**

Create `projects/ui/tsconfig.storybook.json`:

```json
{
  "extends": "./tsconfig.lib.json",
  "include": ["src/**/*.ts", ".storybook/**/*.ts"],
  "exclude": ["**/*.spec.ts"]
}
```

Then add it to the `references` array in the root `tsconfig.json`, after the existing `projects/ui/tsconfig.spec.json` entry:

```json
{
  "path": "./projects/ui/tsconfig.storybook.json"
}
```

- [ ] **Step 7: Add the Storybook configuration directory**

Create `projects/ui/.storybook/main.ts`:

```ts
import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../src/lib/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
};

export default config;
```

Create `projects/ui/.storybook/preview.ts`:

```ts
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
```

Create `projects/ui/.storybook/preview-head.html`, copying the font link from `src/index.html` so the icon ligatures resolve and the typography matches the application:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Zen+Tokyo+Zoo&family=Outfit:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
/>
```

If `@storybook/addon-a11y` or `@storybook/addon-docs` are not already present after Step 1, install them: `npm install --save-dev @storybook/addon-docs@^10.6.0 @storybook/addon-a11y@^10.6.0`.

- [ ] **Step 8: Add the builder targets**

In `angular.json`, inside `projects.ui.architect`, alongside `build`, `test` and `lint`:

```json
        "storybook": {
          "builder": "@storybook/angular:start-storybook",
          "options": {
            "configDir": "projects/ui/.storybook",
            "tsConfig": "projects/ui/tsconfig.storybook.json",
            "compodoc": false,
            "experimentalZoneless": true,
            "port": 6006,
            "styles": ["projects/ui/src/test-styles.scss"],
            "stylePreprocessorOptions": {
              "includePaths": ["projects/ui/src/styles"]
            }
          }
        },
        "build-storybook": {
          "builder": "@storybook/angular:build-storybook",
          "options": {
            "configDir": "projects/ui/.storybook",
            "tsConfig": "projects/ui/tsconfig.storybook.json",
            "compodoc": false,
            "experimentalZoneless": true,
            "outputDir": "dist/storybook",
            "styles": ["projects/ui/src/test-styles.scss"],
            "stylePreprocessorOptions": {
              "includePaths": ["projects/ui/src/styles"]
            }
          }
        }
```

`compodoc: false` is not optional — the option defaults to `true` and compodoc is not installed.

- [ ] **Step 9: Add the npm scripts**

In `package.json`, in `scripts`, after `test:all`:

```json
    "storybook": "ng run ui:storybook",
    "build:storybook": "ng run ui:build-storybook",
```

- [ ] **Step 10: Build Storybook and verify it passes**

Run: `npm run build:storybook`

Expected: PASS, exit code 0, and `dist/storybook/index.html` exists. Confirm with `ls dist/storybook/index.html`.

- [ ] **Step 11: Serve Storybook and check it by eye**

Run: `npm run storybook`

Expected: <http://localhost:6006> lists `Primitives/Button` with four stories. The button carries Material 3 theming, and the `WithIcon` story shows a heart glyph rather than the word `favorite`. Stop the server afterwards.

- [ ] **Step 12: Verify the existing gates still pass**

Run: `npm run lint && npm run depcruise && npm run check:styles && npx prettier --check .`

Expected: all four pass. If Prettier reports the new files, run `npx prettier --write .` and re-check.

- [ ] **Step 13: Commit**

```bash
git add package.json package-lock.json angular.json tsconfig.json projects/ui/tsconfig.lib.json projects/ui/tsconfig.storybook.json projects/ui/.storybook projects/ui/src/lib/button/button.stories.ts
git commit -m "(feature): Catalogue the ui button in Storybook"
```

---

### Task 2: Stories for the display primitives

**Files:**

- Create: `projects/ui/src/lib/badge/badge.stories.ts`, `projects/ui/src/lib/icon/icon.stories.ts`, `projects/ui/src/lib/spinner/spinner.stories.ts`, `projects/ui/src/lib/loading-indicator/loading-indicator.stories.ts`

**Interfaces:**

- Consumes: the story convention and builder targets from Task 1.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Write the badge story**

`BadgeComponent` takes `count` (required number) and `active` (boolean).

```ts
import type { Meta, StoryObj } from '@storybook/angular';

import { BadgeComponent } from './badge.component';

const meta: Meta<BadgeComponent> = {
  title: 'Primitives/Badge',
  component: BadgeComponent,
  args: { count: 3, active: false },
};

export default meta;

type Story = StoryObj<BadgeComponent>;

export const Default: Story = {};

export const Active: Story = { args: { active: true } };

export const Empty: Story = { args: { count: 0 } };

export const ThreeDigits: Story = { args: { count: 128, active: true } };
```

- [ ] **Step 2: Write the icon story**

`IconComponent` takes `name` (required string), `filled` (boolean) and `size` (number).

```ts
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
```

- [ ] **Step 3: Write the spinner story**

`SpinnerComponent` takes `diameter` (number, default 18).

```ts
import type { Meta, StoryObj } from '@storybook/angular';

import { SpinnerComponent } from './spinner.component';

const meta: Meta<SpinnerComponent> = {
  title: 'Primitives/Spinner',
  component: SpinnerComponent,
  args: { diameter: 18 },
  argTypes: {
    diameter: { control: { type: 'range', min: 12, max: 64, step: 2 } },
  },
};

export default meta;

type Story = StoryObj<SpinnerComponent>;

export const Default: Story = {};

export const Large: Story = { args: { diameter: 48 } };
```

- [ ] **Step 4: Write the loading indicator story**

`LoadingIndicatorComponent` takes `message` (string, default `'Loading photos…'`).

```ts
import type { Meta, StoryObj } from '@storybook/angular';

import { LoadingIndicatorComponent } from './loading-indicator.component';

const meta: Meta<LoadingIndicatorComponent> = {
  title: 'Primitives/Loading indicator',
  component: LoadingIndicatorComponent,
  args: { message: 'Loading photos…' },
};

export default meta;

type Story = StoryObj<LoadingIndicatorComponent>;

export const Default: Story = {};

export const LoadingMore: Story = { args: { message: 'Loading more photos…' } };
```

- [ ] **Step 5: Build Storybook and verify**

Run: `npm run build:storybook`

Expected: PASS, exit code 0.

- [ ] **Step 6: Verify the library build is untouched**

Run: `npx ng build ui`

Expected: PASS. This confirms the Task 1 exclude covers the new story files too.

- [ ] **Step 7: Commit**

```bash
git add projects/ui/src/lib/badge/badge.stories.ts projects/ui/src/lib/icon/icon.stories.ts projects/ui/src/lib/spinner/spinner.stories.ts projects/ui/src/lib/loading-indicator/loading-indicator.stories.ts
git commit -m "(feature): Catalogue the ui display primitives in Storybook"
```

---

### Task 3: Stories for the composed primitives

**Files:**

- Create: `projects/ui/src/lib/empty-state/empty-state.stories.ts`, `projects/ui/src/lib/section-heading/section-heading.stories.ts`, `projects/ui/src/lib/icon-button/icon-button.stories.ts`

**Interfaces:**

- Consumes: the story convention from Task 1.
- Produces: nothing other tasks depend on.

Two of these project content through `<ng-content />`, so their stories need a `render` function with a template rather than plain args.

- [ ] **Step 1: Write the empty state story**

`EmptyStateComponent` takes `icon` and `message`, both required strings, and projects content after the message.

```ts
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
```

- [ ] **Step 2: Write the section heading story**

`SectionHeadingComponent` takes `heading` (required), `hint` and `headingId`.

```ts
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
```

- [ ] **Step 3: Write the icon button story**

`IconButtonComponent` takes `icon` and `label`, both required, plus `size` (`'md' | 'sm'`).

```ts
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
```

- [ ] **Step 4: Build Storybook and verify**

Run: `npm run build:storybook`

Expected: PASS, exit code 0.

- [ ] **Step 5: Check the accessibility panel**

Run: `npm run storybook`, open `Primitives/Icon button` and `Primitives/Empty state`, and read the Accessibility tab.

Expected: no violations. If the addon reports a genuine violation in a library component, record it — do not fix application or library behaviour inside this plan; the spec puts behaviour changes out of scope. Stop the server afterwards.

- [ ] **Step 6: Commit**

```bash
git add projects/ui/src/lib/empty-state/empty-state.stories.ts projects/ui/src/lib/section-heading/section-heading.stories.ts projects/ui/src/lib/icon-button/icon-button.stories.ts
git commit -m "(feature): Catalogue the composed ui primitives in Storybook"
```

---

### Task 4: The snackbar story

**Files:**

- Create: `projects/ui/src/lib/snackbar/snackbar.stories.ts`

**Interfaces:**

- Consumes: the story convention from Task 1.
- Produces: nothing other tasks depend on.

`SnackbarComponent` is the awkward one: it injects `MAT_SNACK_BAR_DATA` and `MatSnackBarRef` rather than taking inputs, so it cannot render without those providers. The pattern mirrors `snackbar.component.spec.ts`.

- [ ] **Step 1: Write the snackbar story**

```ts
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';

import { SnackbarComponent, type SnackbarData } from './snackbar.component';

const snackbarProviders = (data: SnackbarData) =>
  applicationConfig({
    providers: [
      { provide: MAT_SNACK_BAR_DATA, useValue: data },
      { provide: MatSnackBarRef, useValue: { dismissWithAction: () => undefined } },
    ],
  });

const meta: Meta<SnackbarComponent> = {
  title: 'Primitives/Snackbar',
  component: SnackbarComponent,
};

export default meta;

type Story = StoryObj<SnackbarComponent>;

export const WithUndo: Story = {
  decorators: [
    snackbarProviders({ message: 'Added photo by Ada Lovelace to favorites', actionLabel: 'Undo' }),
  ],
};

export const DefaultAction: Story = {
  decorators: [snackbarProviders({ message: 'Added photo by Grace Hopper to favorites' })],
};
```

- [ ] **Step 2: Build Storybook and verify**

Run: `npm run build:storybook`

Expected: PASS, exit code 0.

- [ ] **Step 3: Verify the story renders**

Run: `npm run storybook` and open `Primitives/Snackbar`.

Expected: `WithUndo` shows the message and an `Undo` button; `DefaultAction` shows the same message with a `Dismiss` button, which is the component's fallback label. If the story throws a null injector error, the decorator is not applied — check that `decorators` sits on the story, not on `meta`, because each story needs different data. Stop the server afterwards.

- [ ] **Step 4: Run the full local gate set**

Run: `npm run lint && npm run format:check && npm run depcruise && npm run check:styles && npm run test:all && npm run build && npx ng build ui && npm run build:storybook`

Expected: every command exits 0. This is the whole of Phase A verified against the gates that CI will run.

- [ ] **Step 5: Commit**

```bash
git add projects/ui/src/lib/snackbar/snackbar.stories.ts
git commit -m "(feature): Catalogue the ui snackbar in Storybook"
```

---

# Phase B — Playwright

### Task 5: The static server, the picsum mock, and the first journey

The largest task in the plan, because nothing can be tested until the whole harness stands up. Everything after it adds one journey at a time.

**Files:**

- Modify: `package.json`, `angular.json`, `.gitignore`
- Create: `tools/serve-dist.mjs`, `playwright.config.ts`, `e2e/tsconfig.json`, `e2e/fixtures/photos.ts`, `e2e/support/picsum.ts`, `e2e/photostream.spec.ts`

**Interfaces:**

- Consumes: nothing from Phase A.
- Produces: `photoPage(page: number, limit?: number): PicsumDto[]`, `linkHeader(page: number, totalPages?: number): string`, `PAGE_SIZE`, `TOTAL_PAGES` from `e2e/fixtures/photos.ts`; and from `e2e/support/picsum.ts` the re-exported `test` and `expect`, where `test` carries an auto fixture `picsum: PicsumMock` with methods `setTotalPages(total: number): void`, `failList(status: number): void`, `healList(): void` and `listRequests(): number`. Tasks 6–10 import `test` and `expect` from `./support/picsum`, never from `@playwright/test` directly.

- [ ] **Step 1: Install Playwright**

```bash
npm install --save-dev @playwright/test@^1.63.0 @types/node@^26.4.1
npx playwright install chromium webkit
```

`@types/node` resolves transitively today, but `e2e/tsconfig.json` names it in `types` and `e2e/support/picsum.ts` uses `Buffer`. Depending on a transitive resolution for both is fragile, so it is declared explicitly.

- [ ] **Step 2: Write the static server**

Create `tools/serve-dist.mjs`. The SPA fallback is load-bearing: without it a direct visit to `/photos/5` returns 404, exactly as GitHub Pages would without its `404.html` copy.

```js
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve('dist/gallery-template/browser');
const PORT = Number(process.env['PORT'] ?? 4300);

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

if (!existsSync(ROOT)) {
  console.error(`Missing ${ROOT}. Run "npm run build" first.`);
  process.exit(1);
}

const fallback = join(ROOT, 'index.html');

function resolveFile(pathname) {
  const candidate = join(ROOT, normalize(decodeURIComponent(pathname)));

  if (!candidate.startsWith(ROOT)) {
    return fallback;
  }

  return existsSync(candidate) && statSync(candidate).isFile() ? candidate : fallback;
}

createServer((request, response) => {
  const file = resolveFile(new URL(request.url ?? '/', `http://127.0.0.1:${PORT}`).pathname);

  response.writeHead(200, {
    'Content-Type': CONTENT_TYPES[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });

  createReadStream(file).pipe(response);
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Serving ${ROOT} on http://127.0.0.1:${PORT}`);
});
```

- [ ] **Step 3: Write the Playwright configuration**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

const PORT = 4300;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const isCi = !!process.env['CI'];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  reporter: isCi ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'node tools/serve-dist.mjs',
    url: BASE_URL,
    reuseExistingServer: !isCi,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
```

- [ ] **Step 4: Write the editor tsconfig**

Create `e2e/tsconfig.json`:

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "types": ["node"],
    "moduleResolution": "bundler"
  },
  "include": ["**/*.ts"]
}
```

- [ ] **Step 5: Write the photo fixtures**

Create `e2e/fixtures/photos.ts`. The four ratios give masonry something real to measure; the ids are stable so the detail journey can address one by hand.

```ts
export interface PicsumDto {
  readonly id: string;
  readonly author: string;
  readonly width: number;
  readonly height: number;
  readonly url: string;
  readonly download_url: string;
}

export const PAGE_SIZE = 30;
export const TOTAL_PAGES = 3;

const AUTHORS = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Barbara Liskov'];
const RATIOS: readonly (readonly [number, number])[] = [
  [1200, 800],
  [800, 1200],
  [1000, 1000],
  [1600, 900],
];

export function photoPage(page: number, limit: number = PAGE_SIZE): PicsumDto[] {
  return Array.from({ length: limit }, (_, index) => {
    const offset = (page - 1) * limit + index;
    const [width, height] = RATIOS[offset % RATIOS.length];

    return {
      id: String(offset),
      author: AUTHORS[offset % AUTHORS.length],
      width,
      height,
      url: `https://picsum.photos/id/${offset}`,
      download_url: `https://picsum.photos/id/${offset}/${width}/${height}`,
    };
  });
}

export function linkHeader(page: number, totalPages: number = TOTAL_PAGES): string {
  const parts = [`<https://picsum.photos/v2/list?page=1&limit=${PAGE_SIZE}>; rel="first"`];

  if (page < totalPages) {
    parts.push(`<https://picsum.photos/v2/list?page=${page + 1}&limit=${PAGE_SIZE}>; rel="next"`);
  }

  return parts.join(', ');
}
```

- [ ] **Step 6: Write the picsum mock fixture**

Create `e2e/support/picsum.ts`. Two details are not optional. The fixture is `auto` so every spec gets the mock without asking for it. And the list response must carry `access-control-allow-origin` plus `access-control-expose-headers: link` — the application fetches picsum cross-origin, and without the expose header the browser hides `Link` from `HttpClient`, `hasNextPage` returns false, and the infinite scroll silently never advances.

```ts
import { test as base, type Route } from '@playwright/test';

import { PAGE_SIZE, TOTAL_PAGES, linkHeader, photoPage } from '../fixtures/photos';

const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

export interface PicsumMock {
  setTotalPages(total: number): void;
  failList(status: number): void;
  healList(): void;
  listRequests(): number;
}

export const test = base.extend<{ picsum: PicsumMock }>({
  picsum: [
    async ({ page }, use) => {
      let totalPages = TOTAL_PAGES;
      let failureStatus: number | null = null;
      let served = 0;

      await page.route('**/fonts.googleapis.com/**', route => route.abort());
      await page.route('**/fonts.gstatic.com/**', route => route.abort());

      await page.route('**/picsum.photos/v2/list*', async (route: Route) => {
        served += 1;

        if (failureStatus !== null) {
          await route.fulfill({
            status: failureStatus,
            headers: { 'access-control-allow-origin': '*' },
            body: 'unavailable',
          });
          return;
        }

        const requested = Number(new URL(route.request().url()).searchParams.get('page') ?? '1');

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: {
            'access-control-allow-origin': '*',
            'access-control-expose-headers': 'link',
            link: linkHeader(requested, totalPages),
          },
          body: JSON.stringify(photoPage(requested, PAGE_SIZE)),
        });
      });

      await page.route('**/picsum.photos/id/*/info', async (route: Route) => {
        const id = new URL(route.request().url()).pathname.split('/')[2];
        const photo = photoPage(1, PAGE_SIZE).find(item => item.id === id);

        await route.fulfill({
          status: photo ? 200 : 404,
          contentType: 'application/json',
          headers: { 'access-control-allow-origin': '*' },
          body: JSON.stringify(photo ?? { error: 'not found' }),
        });
      });

      await page.route(/picsum\.photos\/id\/\d+\/\d+\/\d+/, async (route: Route) => {
        await route.fulfill({
          status: 200,
          contentType: 'image/png',
          headers: { 'access-control-allow-origin': '*' },
          body: TRANSPARENT_PNG,
        });
      });

      await use({
        setTotalPages: total => {
          totalPages = total;
        },
        failList: status => {
          failureStatus = status;
        },
        healList: () => {
          failureStatus = null;
        },
        listRequests: () => served,
      });
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
```

- [ ] **Step 7: Write the failing first journey**

Create `e2e/photostream.spec.ts`. Tiles render as buttons because the photostream uses the default `interaction = 'toggle'`; their accessible name comes from `aria-label`, and the icon inside is `aria-hidden`, so names are clean.

```ts
import { expect, test } from './support/picsum';

test.describe('photostream', () => {
  test('renders the first page of photos', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Random photostream/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Add photo by .+ to favorites/ })).toHaveCount(
      30,
    );
  });

  test('opens a snackbar when a tile is tapped', async ({ page }) => {
    await page.goto('/');

    await page
      .getByRole('button', { name: 'Add photo by Ada Lovelace to favorites' })
      .first()
      .click();

    await expect(page.getByText('Added photo by Ada Lovelace to favorites')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible();
  });
});
```

- [ ] **Step 8: Run it and watch it fail for the right reason**

Run: `npx playwright test --project=chromium`

Expected: FAIL, because `dist/gallery-template/browser` does not exist yet and `tools/serve-dist.mjs` exits with `Missing … Run "npm run build" first.` This confirms the server guard works.

- [ ] **Step 9: Build, then run the journey and watch it pass**

Run: `npm run build && npx playwright test`

Expected: PASS on both `chromium` and `webkit`, four tests total.

- [ ] **Step 10: Add the scripts, lint coverage and ignores**

In `package.json`, in `scripts`, after `build:storybook`:

```json
    "test:e2e": "ng build && playwright test",
    "test:e2e:ui": "playwright test --ui",
```

In `angular.json`, extend the application's lint patterns so ESLint sees the new sources:

```json
            "lintFilePatterns": ["src/**/*.ts", "src/**/*.html", "e2e/**/*.ts"]
```

Append to `.gitignore`, under the `# Miscellaneous` group:

```
/test-results
/playwright-report
/blob-report
```

- [ ] **Step 11: Verify the gates**

Run: `npm run lint && npx prettier --check . && npm run depcruise && npm run check:styles`

Expected: all pass. `depcruise` still reports no violations — `e2e/` and `tools/` sit outside the `src projects` scope it cruises.

- [ ] **Step 12: Commit**

```bash
git add package.json package-lock.json angular.json .gitignore playwright.config.ts tools/serve-dist.mjs e2e
git commit -m "(test): Drive the photostream through Playwright against the built app"
```

---

### Task 6: The infinite scroll journey

**Files:**

- Modify: `e2e/photostream.spec.ts`

**Interfaces:**

- Consumes: `test`, `expect`, `picsum.setTotalPages` from Task 5.
- Produces: nothing other tasks depend on.

Both tests pin the page count deliberately. With the fixture's default of three pages, the sentinel survives the first append and — because its root margin is 400 pixels — may still be intersecting, so the store would fetch page three and the count would race between 60 and 90. Capping the collection at two pages removes the race instead of papering over it with a timeout.

- [ ] **Step 1: Write the failing tests**

Append to the `describe` block in `e2e/photostream.spec.ts`:

```ts
test('appends the next page when the sentinel comes into view', async ({ page, picsum }) => {
  picsum.setTotalPages(2);
  await page.goto('/');
  await expect(page.getByRole('button', { name: /to favorites/ })).toHaveCount(30);

  await page.locator('app-stream-sentinel').scrollIntoViewIfNeeded();

  await expect(page.getByRole('button', { name: /to favorites/ })).toHaveCount(60);
});

test('announces the end of the collection once no page is left', async ({ page, picsum }) => {
  picsum.setTotalPages(1);
  await page.goto('/');

  await expect(page.getByText('You’ve reached the end of the collection.')).toBeVisible();
  await expect(page.locator('app-stream-sentinel')).toHaveCount(0);
});
```

- [ ] **Step 2: Run them**

Run: `npx playwright test e2e/photostream.spec.ts`

Expected: PASS on both projects. These journeys test existing behaviour, so no implementation follows — a failure here is a finding about the application or about the mock, not a missing feature.

If `appends the next page` fails with the count stuck at 30, the cause is almost always the `Link` header being invisible to `HttpClient`. Confirm `access-control-expose-headers: link` is present in the Task 5 fixture before suspecting the application.

If it fails only on WebKit, replace `scrollIntoViewIfNeeded()` with the sentinel's own control, which exists precisely as a non-observer path: `await page.getByRole('button', { name: 'Load more' }).click()`.

- [ ] **Step 3: Commit**

```bash
git add e2e/photostream.spec.ts
git commit -m "(test): Cover the photostream paging and its end note"
```

---

### Task 7: The grid layout journey

**Files:**

- Create: `e2e/grid-layout.spec.ts`

**Interfaces:**

- Consumes: `test`, `expect` from Task 5.
- Produces: nothing other tasks depend on.

The toggle renders two buttons labelled `Square tiles` and `Original proportions`, both carrying `aria-pressed`. The preference persists to `localStorage` under `gallery.grid-layout`.

- [ ] **Step 1: Write the failing tests**

```ts
import { expect, test } from './support/picsum';

const STORAGE_KEY = 'gallery.grid-layout';

test.describe('grid layout', () => {
  test('starts on square tiles', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Square tiles' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('remembers the masonry choice across a reload', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Original proportions' }).click();

    await expect(page.getByRole('button', { name: 'Original proportions' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBe('masonry');

    await page.reload();

    await expect(page.getByRole('button', { name: 'Original proportions' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('honours a layout stored before the first visit', async ({ page }) => {
    await page.addInitScript(key => localStorage.setItem(key, 'masonry'), STORAGE_KEY);

    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Original proportions' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
```

- [ ] **Step 2: Run them**

Run: `npx playwright test e2e/grid-layout.spec.ts`

Expected: PASS on both projects, six tests.

- [ ] **Step 3: Commit**

```bash
git add e2e/grid-layout.spec.ts
git commit -m "(test): Cover the grid layout preference end to end"
```

---

### Task 8: The scroll restoration journey

**Files:**

- Create: `e2e/scroll-restore.spec.ts`

**Interfaces:**

- Consumes: `test`, `expect`, `picsum.setTotalPages` from Task 5.
- Produces: nothing other tasks depend on.

The only route out of the photostream and back that the interface actually offers is the Favorites tab and the empty state's `Browse photos` link — tiles do not link to the detail page. The store is root-provided, so the accumulated pages survive the round trip while the page component is recreated.

The collection is capped at two pages for the same reason as in Task 6: on return the sentinel must not be able to fetch a third page and turn the count assertion into a race.

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test } from './support/picsum';

test.describe('scroll restoration', () => {
  test('restores the accumulated pages and the scroll offset', async ({ page, picsum }) => {
    picsum.setTotalPages(2);
    await page.goto('/');
    await page.locator('app-stream-sentinel').scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: /to favorites/ })).toHaveCount(60);

    await page.evaluate(() => window.scrollTo(0, 1500));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
    const before = await page.evaluate(() => window.scrollY);

    await page.getByRole('link', { name: /Favorites/ }).click();
    await expect(page.getByRole('heading', { name: /Favorites/ })).toBeVisible();

    await page.getByRole('link', { name: 'Browse photos' }).click();

    await expect(page.getByRole('button', { name: /to favorites/ })).toHaveCount(60);
    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 10_000 })
      .toBeGreaterThan(before - 200);
  });
});
```

- [ ] **Step 2: Run it**

Run: `npx playwright test e2e/scroll-restore.spec.ts`

Expected: PASS on both projects.

The tolerance of 200 pixels is deliberate: the restore runs across several render passes and, in masonry, waits for the grid to be measured. An exact equality assertion would be flaky by construction. If the test fails because `scrollY` returns to 0, that is a genuine finding about the restore logic — record it, do not weaken the assertion further.

- [ ] **Step 3: Commit**

```bash
git add e2e/scroll-restore.spec.ts
git commit -m "(test): Cover the photostream scroll restoration end to end"
```

---

### Task 9: The photo detail journey

**Files:**

- Create: `e2e/photo-detail.spec.ts`

**Interfaces:**

- Consumes: `test`, `expect`, `picsum` from Task 5.
- Produces: nothing other tasks depend on.

The detail page is reachable only by URL. `photoPage(1)` gives ids `0` to `29`, and id `0` belongs to `Ada Lovelace`.

- [ ] **Step 1: Write the failing tests**

```ts
import { expect, test } from './support/picsum';

test.describe('photo detail', () => {
  test('renders a photo addressed directly by id', async ({ page }) => {
    await page.goto('/photos/0');

    await expect(page.getByText('Ada Lovelace')).toBeVisible();
    await expect(page.getByRole('img', { name: 'photo by Ada Lovelace' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
  });

  test('reports a photo that does not exist', async ({ page }) => {
    await page.goto('/photos/99999');

    await expect(page.getByText('That photo does not exist.')).toBeVisible();
  });

  test('recovers from a failed load when the retry is pressed', async ({ page }) => {
    await page.route('**/picsum.photos/id/1/info', route =>
      route.fulfill({
        status: 500,
        headers: { 'access-control-allow-origin': '*' },
        body: 'unavailable',
      }),
    );

    await page.goto('/photos/1');

    await expect(
      page.getByText('Could not load this photo. Check your connection and try again.'),
    ).toBeVisible();

    await page.unroute('**/picsum.photos/id/1/info');
    await page.getByRole('button', { name: 'Try again' }).click();

    await expect(page.getByText('Grace Hopper')).toBeVisible();
  });
});
```

- [ ] **Step 2: Run them**

Run: `npx playwright test e2e/photo-detail.spec.ts`

Expected: PASS on both projects, six tests.

The route added inside the third test is registered after the fixture's handlers, so it takes precedence for that one URL; `unroute` hands the URL back to the fixture. If the retry test proves flaky, assert on the request count through `picsum.listRequests()` rather than lengthening timeouts.

- [ ] **Step 3: Commit**

```bash
git add e2e/photo-detail.spec.ts
git commit -m "(test): Cover the photo detail page end to end"
```

---

### Task 10: The favorites and error journeys

**Files:**

- Create: `e2e/favorites.spec.ts`, `e2e/errors.spec.ts`

**Interfaces:**

- Consumes: `test`, `expect`, `picsum.failList`, `picsum.healList` from Task 5.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Write the favorites journey**

Create `e2e/favorites.spec.ts`:

```ts
import { expect, test } from './support/picsum';

test.describe('favorites', () => {
  test('shows an empty state and leads back to the stream', async ({ page }) => {
    await page.goto('/favorites');

    await expect(page.getByRole('heading', { name: /Favorites/ })).toBeVisible();
    await expect(
      page.getByText('No favorites yet. Photos you tap in the photostream show up here.'),
    ).toBeVisible();

    await page.getByRole('link', { name: 'Browse photos' }).click();

    await expect(page.getByRole('heading', { name: /Random photostream/ })).toBeVisible();
  });

  test('marks the active tab', async ({ page }) => {
    await page.goto('/favorites');

    await expect(page.getByRole('link', { name: /Favorites/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('redirects an unknown route back to the stream', async ({ page }) => {
    await page.goto('/nowhere');

    await expect(page.getByRole('heading', { name: /Random photostream/ })).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/');
  });
});
```

- [ ] **Step 2: Write the error journey**

Create `e2e/errors.spec.ts`. The store retries automatically with delays of 1000, 2000 and 4000 milliseconds, so the mock has to stay broken for the whole sequence — roughly seven seconds — before the state settles.

```ts
import { expect, test } from './support/picsum';

test.describe('errors', () => {
  test('settles on the fatal empty state after the automatic retries', async ({ page, picsum }) => {
    picsum.failList(500);

    await page.goto('/');

    await expect(
      page.getByText('Could not load photos. Check your connection and try again.'),
    ).toBeVisible({ timeout: 15_000 });
    await expect.poll(() => picsum.listRequests(), { timeout: 15_000 }).toBeGreaterThanOrEqual(4);
  });

  test('recovers when the retry is pressed against a healthy api', async ({ page, picsum }) => {
    picsum.failList(500);
    await page.goto('/');
    await expect(
      page.getByText('Could not load photos. Check your connection and try again.'),
    ).toBeVisible({ timeout: 15_000 });

    picsum.healList();
    await page.getByRole('button', { name: 'Try again' }).click();

    await expect(page.getByRole('button', { name: /to favorites/ })).toHaveCount(30);
  });
});
```

- [ ] **Step 3: Run the whole suite**

Run: `npm run test:e2e`

Expected: PASS on both projects. The count is four journeys in `photostream`, three in `grid-layout`, one in `scroll-restore`, three in `photo-detail`, three in `favorites` and two in `errors` — sixteen tests per project, thirty-two in total.

The `listRequests()` assertion expects at least four calls: the initial request plus three automatic retries. If it observes fewer, the retry timer was cut short by the page settling early; raise the poll timeout before adjusting the expectation, and only lower the bound if the store's behaviour has genuinely changed.

- [ ] **Step 4: Run the full local gate set**

Run: `npm run lint && npm run format:check && npm run depcruise && npm run check:styles && npm run test:all && npm run build && npx ng build ui && npm run build:storybook`

Expected: every command exits 0.

- [ ] **Step 5: Commit**

```bash
git add e2e/favorites.spec.ts e2e/errors.spec.ts
git commit -m "(test): Cover the favorites page and the photostream failure path"
```

---

# Phase C — CI and publication

### Task 11: The two new CI gates

**Files:**

- Modify: `.github/workflows/ci.yml`

**Interfaces:**

- Consumes: the `build:storybook` script from Task 1 and the Playwright setup from Task 5.
- Produces: nothing other tasks depend on.

`ci.yml` runs on every pull request and again inside `deploy.yml` through `workflow_call`, so both gates guard the published site.

- [ ] **Step 1: Add the end-to-end gate**

In `.github/workflows/ci.yml`, immediately after the `Build the application` step:

```yaml
- name: Cache the Playwright browsers
  id: playwright-cache
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}

- name: Install the Playwright browsers
  run: npx playwright install --with-deps chromium webkit

- name: Run the end-to-end tests
  run: npx playwright test

- name: Upload the Playwright report
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 7
```

`npx playwright install --with-deps` runs even on a cache hit, because the operating system packages WebKit needs live outside the cached directory; with the browsers already present it finishes quickly.

The application is built by the preceding step, so `playwright test` finds `dist/gallery-template/browser` and its `webServer` only serves it. Do not add a build here.

- [ ] **Step 2: Add the Storybook gate**

At the end of the same job, after `Build the ui library`:

```yaml
- name: Build Storybook
  run: npm run build:storybook
```

- [ ] **Step 3: Format the workflow**

`lint-staged` does not cover `.github/**`, so Prettier has to be run by hand or `format:check` will fail in CI.

Run: `npx prettier --write .github/workflows/ci.yml && npx prettier --check .`

Expected: the check passes.

- [ ] **Step 4: Verify the workflow parses**

Run: `node -e "require('node:fs').readFileSync('.github/workflows/ci.yml','utf8')" && npx prettier --check .github/workflows/ci.yml`

Expected: exit code 0. A syntax error in the YAML surfaces as a Prettier parse failure.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "(chore): Gate pull requests on the end-to-end tests and the Storybook build"
```

---

### Task 12: Storybook on GitHub Pages

**Files:**

- Modify: `.github/workflows/deploy.yml`

**Interfaces:**

- Consumes: the `build:storybook` script from Task 1.
- Produces: the published Storybook at `/storybook/`.

- [ ] **Step 1: Verify the subpath assumption locally**

This is the spec's first open risk, so settle it before touching the workflow.

```bash
npm run build:storybook
grep -o 'src="[^"]*"' dist/storybook/index.html | head -20
```

Expected: the asset references are relative — `./assets/…` or `assets/…` — rather than absolute paths beginning with `/`.

If any reference is absolute, stop here rather than improvising. The spec listed this as a risk to resolve empirically, and the remedy — a base-path option, a separate Pages artefact, or a different publication path — is a design decision, not an implementation detail. Report the exact output of the `grep` and leave Task 12 unfinished; Tasks 1 through 11 stand on their own and the Storybook build gate from Task 11 still guards the stories.

- [ ] **Step 2: Prove it end to end locally**

```bash
npm run build
mkdir -p dist/gallery-template/browser/storybook
cp -r dist/storybook/. dist/gallery-template/browser/storybook/
node tools/serve-dist.mjs
```

Open <http://127.0.0.1:4300/storybook/> in a browser.

Expected: Storybook loads and lists the nine components. Stop the server afterwards, and remove the copy so it does not confuse a later end-to-end run: `rm -rf dist/gallery-template/browser/storybook`.

- [ ] **Step 3: Add the publication steps**

In `.github/workflows/deploy.yml`, in the `build` job, between `Build the application` and `Add the SPA fallback`:

```yaml
- name: Build Storybook
  run: npm run build:storybook

- name: Add Storybook to the Pages artifact
  run: |
    mkdir -p dist/gallery-template/browser/storybook
    cp -r dist/storybook/. dist/gallery-template/browser/storybook/
```

The step order matters: the SPA fallback copies `index.html` to `404.html`, and doing that before Storybook is added keeps the fallback pointing at the application shell rather than at anything Storybook wrote.

- [ ] **Step 4: Format and verify**

Run: `npx prettier --write .github/workflows/deploy.yml && npx prettier --check .`

Expected: the check passes.

- [ ] **Step 5: Run the whole gate set one last time**

Run: `npm run lint && npm run format:check && npm run depcruise && npm run check:styles && npm run test:all && npm run build && npx ng build ui && npm run build:storybook && npx playwright test`

Expected: every command exits 0. This is the nine CI gates reproduced locally.

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "(chore): Publish Storybook alongside the application on GitHub Pages"
```

- [ ] **Step 7: Push and open a pull request**

```bash
git push -u origin HEAD
gh pr create --draft --title "Storybook for the ui library, and Playwright end-to-end tests" --body-file - <<'BODY'
Adds a Storybook catalogue of the nine `@gallery/ui` primitives and Playwright coverage of six visitor journeys, both wired into CI. Storybook is published alongside the application on GitHub Pages at `/storybook/`.

Design: `context/tooling/2026-09-05-playwright-storybook-design.md`
Plan: `context/tooling/2026-09-05-playwright-storybook-plan.md`
BODY
```

Watch the run with `gh run watch`. The pull request is where the two new gates prove themselves on a clean machine; a green local run does not substitute for it, particularly for WebKit, which behaves differently on Ubuntu than on macOS.

---

## Acceptance

The plan is done when all six of the spec's acceptance criteria hold:

1. `npm run storybook` serves nine components with icons and Material theming intact.
2. `npm run build:storybook` produces `dist/storybook` and exits zero.
3. `npm run test:e2e` passes on Chromium and WebKit from a clean checkout.
4. The seven pre-existing gates still pass, `ng build ui` among them.
5. `ci.yml` runs nine gates and turns red when a journey is deliberately broken.
6. A deployment serves the application at the site root and Storybook under `/storybook/`.
