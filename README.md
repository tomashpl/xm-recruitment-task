# Gallery Template

A photo library app built with Angular 22 and Angular Material. It has three screens: an infinite-feeling photostream at `/`, a favourites list at `/favorites`, and a single-photo page at `/photos/:id`.

This is a presentational component library and routing skeleton — there is no backend. Photos are static fixtures (`src/app/shared/fixtures/mock-photos.ts`) whose images are served straight from [picsum.photos](https://picsum.photos). No HTTP calls, persistence, real infinite scroll, or real favourites count exist yet.

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
