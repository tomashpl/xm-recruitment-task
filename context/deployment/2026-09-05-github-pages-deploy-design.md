# GitHub Actions CI and GitHub Pages deployment

Date: 2026-09-05
Status: implemented

## Goal

Publish the `gallery-template` application to GitHub Pages on every merge to `main`,
behind the same quality gates that guard local commits. Until now the repository has
had no CI at all: the seven gates run only through husky hooks, which `--no-verify`
bypasses and which never run on a machine other than the author's.

## Verified facts about the repository

Established by inspection on 2026-09-05, not assumed:

| Fact            | Value                                                                     |
| --------------- | ------------------------------------------------------------------------- |
| Remote          | `github.com/tomashpl/xm-recruitment-task`, public, default branch `main`  |
| Pages           | enabled 2026-09-05 with `build_type: workflow`; no deployment yet         |
| Published URL   | `https://tomashpl.github.io/xm-recruitment-task/`                         |
| Build output    | `dist/gallery-template/browser/` (confirmed by running the build)         |
| Local toolchain | Node 24.18.0, npm 11.16.0                                                 |
| Karma config    | no `karma.conf.js`; the `@angular/build:karma` builder runs with defaults |
| Existing CI     | none; no `.github/` directory                                             |

Latest action versions, read from the GitHub API rather than from memory:
`actions/checkout@v7`, `actions/setup-node@v7`, `actions/configure-pages@v6`,
`actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`.

## Decisions

**Full CI, not deploy-only.** The repository already defines seven gates — `lint`,
`format:check`, `depcruise`, `check:styles`, `test:all`, `build`, `ng build ui`. CI
repeats all of them so that a bypassed hook, or work pushed by a parallel agent,
cannot reach the published site unchecked.

**Reusable workflow, not `workflow_run`.** `ci.yml` declares `workflow_call`, and
`deploy.yml` consumes it as a job. This keeps the gates defined once and makes the
dependency real: `needs: gates` blocks deployment on failure. The `workflow_run`
alternative would require hand-written checks for three things GitHub otherwise
handles — not running after a failed CI, checking out the commit that triggered CI
rather than the default branch head, and passing the build artifact between two
separate runs.

**`404.html` as a copy of `index.html`.** Pages serves static files with no
server-side fallback, so `/xm-recruitment-task/photos/42` and any browser refresh on
a nested route would return 404. Copying the built `index.html` to `404.html` lets
Pages serve the application shell for unknown paths and hands routing back to Angular.
The response carries HTTP 404 rather than 200, which is irrelevant for a demo. The
alternatives were rejected: hash routing changes `app.config.ts` and the router specs,
and static prerendering cannot cover the dynamic `photos/:id` route anyway.

**Automatic deployment from `main`, plus a manual trigger.** The published site always
reflects `main`, so each merged feature is immediately visible. `workflow_dispatch`
covers redeployment without a code change.

**No changes outside `.github/` and `context/`.** A second agent is working on features
in the same repository. Touching `package.json` or `angular.json` invites a merge
conflict for no benefit, so the base href is passed as a CLI flag rather than added as
a build configuration.

## Architecture

### `ci.yml`

```
on: pull_request, workflow_call
concurrency: ci-<ref>, cancel-in-progress: true

job gates (ubuntu-latest):
  checkout -> setup-node (24, npm cache) -> npm ci
  npm run lint
  npm run format:check
  npm run depcruise
  npm run check:styles
  npm run test:all
  npm run build
  npx ng build ui
```

One job with sequential steps. Splitting the gates across parallel jobs would shorten
wall-clock time but pay for a separate `npm ci` in each job, which at this size costs
more than it saves. The order is deliberate: cheap static gates first, tests and builds
last, so a formatting mistake fails in seconds rather than minutes.

### `deploy.yml`

```
on: push to main, workflow_dispatch
permissions: contents read, pages write, id-token write
concurrency: pages, cancel-in-progress: false

job gates:  uses ./.github/workflows/ci.yml
job build:  needs gates
  checkout -> setup-node -> npm ci
  configure-pages
  ng build --base-href "<base_path>/"
  cp dist/gallery-template/browser/index.html dist/gallery-template/browser/404.html
  upload-pages-artifact (path: dist/gallery-template/browser)
job deploy: needs build
  environment github-pages
  deploy-pages
```

The base href is derived from `steps.pages.outputs.base_path`, the value `configure-pages`
computes, rather than from `github.event.repository.name` or a hardcoded string. That output
evaluates to `/xm-recruitment-task` for a project site and to an empty string for a user site
or a custom domain, so appending `/` yields the correct base href in all three cases — whereas
the repository name would have been wrong for a user site and for a custom domain.
`cancel-in-progress` is `false` here — unlike in CI — because interrupting a Pages publication
midway leaves the site in a partial state, while interrupting a test run costs nothing.

## The pipeline must pass its own gates

`.prettierignore` excludes only `dist`, `coverage`, `.angular`, `node_modules` and
`package-lock.json`, so `format:check` covers `.github/**/*.yml` and this document as
well. The workflow files are therefore subject to the gate they themselves run, and
must be formatted with Prettier before the first push. This is a constraint, not a
risk: it is known now and simply has to be honoured. Note that lint-staged auto-formats `*.{scss,json,md,mjs,cjs}` on commit but does not cover `*.yml`, so the workflow files are the one category the hooks will not silently fix.

## Risks to resolve empirically

Three unknowns must be settled by observing a real run, not by assertion:

1. **`ChromeHeadless` on the runner.** There is no `karma.conf.js`, so there is no
   custom launcher with `--no-sandbox`. Chrome normally starts on `ubuntu-latest`
   without it, but if it does not, a Karma configuration file becomes necessary — the
   only scenario in this work that would touch a file outside `.github/` and `context/`.
2. **`prepare: husky` during `npm ci`.** Husky 9 is expected to be inert in CI, but a
   failing `prepare` script is a common cause of a red `npm ci`.
3. **Whether the copied `404.html` actually serves nested routes.** Only a live request
   to the published site can confirm this.

The first two were settled by the CI runs on this branch: `ChromeHeadless` started on
`ubuntu-latest` with no launcher configuration, and `npm ci` completed cleanly with
husky's `prepare` script. No `karma.conf.js` was created, and Tasks 2 and 3 of the
contingency plan were never executed. The third risk stays open until the first live
deployment.

## Acceptance criteria

- `ci.yml` runs on the pull request for this branch and passes, with all seven gates
  visible as executed steps.
- After the merge, `deploy.yml` completes and reports a deployment URL.
- `https://tomashpl.github.io/xm-recruitment-task/` loads the photostream with styles
  and images intact, proving the base href is correct.
- `https://tomashpl.github.io/xm-recruitment-task/favorites` loads directly, and
  refreshing the browser on a `/photos/:id` page keeps the application alive, proving
  the `404.html` fallback works.
- The browser console is free of asset or routing errors.

## Out of scope

Preview deployments per pull request, custom domain, deployment badges in the README,
bundle-size reporting, and end-to-end tests. None of them is needed to publish the
application, and each can be added later without reworking what is specified here.
