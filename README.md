# Gallery Template

A photo library app built with Angular 22 and Angular Material. It has three screens: an infinite-feeling photostream at `/`, a favourites list at `/favorites`, and a single-photo page at `/photos/:id`.

Photos come from the [picsum.photos](https://picsum.photos) API: the photostream lists its first page and the single-photo page resolves the route id against the service. Favourites are not persisted yet, and the photostream loads one page rather than scrolling infinitely.

## Install

```bash
npm ci
```

## Run

```bash
npm start
```

Serves the app at `http://localhost:4200`, reloading automatically on source changes.

## Test

```bash
npm test
```

Runs the Jasmine/Karma unit tests in watch mode against Chrome. For a single CI-style run:

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```

## Build

```bash
npm run build
```

Builds a production bundle into `dist/gallery-template`.

## Storybook

```bash
npm run storybook
```

Serves a browsable catalogue of the `@gallery/ui` component library at `http://localhost:6006`.

```bash
npm run build:storybook
```

Builds the static catalogue into `dist/storybook`.

## End-to-end tests

```bash
npm run test:e2e
```

Runs the Playwright suite against Chromium and WebKit. This builds the production bundle first and serves it with a small static server, so the tests exercise the real bundle rather than the dev server; running `npx playwright test` on its own requires an existing `dist/gallery-template` build. For an interactive run:

```bash
npm run test:e2e:ui
```
