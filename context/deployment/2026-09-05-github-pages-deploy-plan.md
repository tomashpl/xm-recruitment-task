# CI and GitHub Pages deployment implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish `gallery-template` to GitHub Pages on every merge to `main`, behind the seven
quality gates the repository already defines.

**Architecture:** Two workflow files. `ci.yml` runs the gates and declares `workflow_call` so it can
be reused. `deploy.yml` consumes it as a job, then builds with a Pages-aware base href and publishes
the artifact. The dependency is expressed with `needs:`, so a red gate blocks publication without
any hand-written condition.

**Tech Stack:** GitHub Actions, Node 24, Angular 22 (`@angular/build:application`), Karma with
headless Chrome, `actionlint` for local validation.

**Spec:** `context/deployment/2026-09-05-github-pages-deploy-design.md`

## Global Constraints

- Action versions, read from the GitHub API on 2026-09-05: `actions/checkout@v7`,
  `actions/setup-node@v7`, `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`,
  `actions/deploy-pages@v5`.
- Node version in CI: `24` (local toolchain is 24.18.0).
- Build output directory: `dist/gallery-template/browser` — confirmed by running the build, not
  assumed.
- Only `.github/` and `context/` may change. A `karma.conf.js` is permitted only under Task 3, and
  only after reporting the failure that requires it.
- Every YAML file must pass `actionlint` **and** `prettier --check` before being committed.
  `lint-staged` covers `*.{ts,html,scss,json,md,mjs,cjs}` and does **not** cover `*.yml`, so the
  hooks will not fix workflow formatting.
- Commit messages in English, format `(type): Message`, no AI attribution of any kind.
- Work happens on `feature/github-pages-deploy`. Never push to `main`; the merge is the repository
  owner's action.
- Published site: `https://tomashpl.github.io/xm-recruitment-task/`. Pages is already enabled with
  `build_type: workflow`.

---

### Task 1: `ci.yml` — the quality gates, proven on a pull request

**Files:**

- Create: `.github/workflows/ci.yml`

**Interfaces:**

- Consumes: the npm scripts already defined in `package.json` — `lint`, `format:check`, `depcruise`,
  `check:styles`, `test:all`, `build`.
- Produces: a workflow named `CI` with a single job `gates`, callable by other workflows through
  `workflow_call`. Task 4 depends on that exact path and trigger.

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/ci.yml` with exactly this content:

```yaml
name: CI

on:
  pull_request:
  workflow_call:

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  gates:
    name: Quality gates
    runs-on: ubuntu-latest
    steps:
      - name: Check out the repository
        uses: actions/checkout@v7

      - name: Set up Node
        uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

      - name: Check import boundaries
        run: npm run depcruise

      - name: Check style boundaries
        run: npm run check:styles

      - name: Run tests
        run: npm run test:all

      - name: Build the application
        run: npm run build

      - name: Build the ui library
        run: npx ng build ui
```

The step order is deliberate: the cheap static gates run first, so a formatting mistake fails in
seconds rather than after the test suite.

- [ ] **Step 2: Validate the syntax locally**

Run: `actionlint .github/workflows/ci.yml`

Expected: no output, exit code 0. Any output is a real error — fix it before continuing.

- [ ] **Step 3: Check the formatting**

Run: `node node_modules/prettier/bin/prettier.cjs --check .github/workflows/ci.yml`

Expected: `All matched files use Prettier code style!`

If it reports issues, run the same command with `--write` and re-run the check. This is the gate the
workflow will run against itself, so it has to pass locally first.

- [ ] **Step 4: Commit**

Stage `.github/workflows/ci.yml` and commit it with the message
`(chore): Run the quality gates on pull requests`.

- [ ] **Step 5: Push the branch and open a pull request**

Push `feature/github-pages-deploy` to `origin` with upstream tracking, then open a draft pull
request titled `Add CI and GitHub Pages deployment`, with a body that states what it does and points
at `context/deployment/2026-09-05-github-pages-deploy-design.md`.

- [ ] **Step 6: Watch the run and confirm it is green**

Run: `gh run watch --exit-status`

Expected: the `gates` job succeeds and all ten steps show as executed.

This is the actual test for this task. Do not mark it complete on the basis that the YAML looks
correct — the run must be green. If it fails, identify which step failed and go to Task 2 (install /
husky) or Task 3 (Chrome), whichever matches. Any other failure: stop and report it rather than
guessing.

---

### Task 2: Contingency — the install step fails on the `prepare` script

Execute this task **only** if Task 1 Step 6 failed at the `Install dependencies` step with an error
mentioning `husky` or `prepare`. Otherwise skip it entirely and leave the workflow untouched.

**Files:**

- Modify: `.github/workflows/ci.yml` — the `Install dependencies` step

**Interfaces:**

- Consumes: the `gates` job from Task 1.
- Produces: no interface change; the job keeps its name and behaviour.

- [ ] **Step 1: Confirm the diagnosis**

Run: `gh run view --log-failed | grep -i -A5 "husky|prepare"`

Expected: the log shows the `prepare` script as the cause. If it does not, this task is the wrong
fix — stop and report.

- [ ] **Step 2: Disable lifecycle scripts for the install**

Replace the `Install dependencies` step with:

```yaml
- name: Install dependencies
  run: npm ci --ignore-scripts
  env:
    HUSKY: 0
```

`HUSKY: 0` is husky's own opt-out; `--ignore-scripts` is the belt-and-braces version. Git hooks are
irrelevant on a runner, so nothing of value is lost.

- [ ] **Step 3: Validate and check formatting**

Run: `actionlint .github/workflows/ci.yml`

Run: `node node_modules/prettier/bin/prettier.cjs --check .github/workflows/ci.yml`

Expected: both clean.

- [ ] **Step 4: Commit, push and re-run**

Commit with `(fix): Skip lifecycle scripts when installing on the runner`, push, then
`gh run watch --exit-status`.

Expected: the install step now succeeds.

---

### Task 3: Contingency — headless Chrome fails to start

Execute this task **only** if Task 1 Step 6 failed at the `Run tests` step with a Chrome or sandbox
error. Otherwise skip it.

**Files:**

- Modify: `.github/workflows/ci.yml` — add one step before `Run tests`

**Interfaces:**

- Consumes: the `gates` job from Task 1.
- Produces: no interface change.

- [ ] **Step 1: Read the actual failure**

Run: `gh run view --log-failed | grep -i -B2 -A10 "chrome|sandbox|namespace"`

There are two distinct failures and they need different fixes:

- Chrome cannot be found (`No binary for ChromeHeadless browser`) → Step 2a.
- Chrome is found but crashes on startup, typically mentioning the sandbox or user namespaces →
  Step 2b. Ubuntu 24.04 restricts unprivileged user namespaces through AppArmor, which is what
  breaks the Chrome sandbox on the runner.

- [ ] **Step 2a: Point Karma at the installed Chrome**

Insert before the `Run tests` step:

```yaml
- name: Locate Chrome for Karma
  run: echo "CHROME_BIN=$(which google-chrome)" >> "$GITHUB_ENV"
```

- [ ] **Step 2b: Allow the Chrome sandbox to start**

Insert before the `Run tests` step:

```yaml
- name: Allow unprivileged user namespaces
  run: sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
```

This is preferred over adding `--no-sandbox`, because the latter would require creating a
`karma.conf.js` with a custom launcher — a change outside `.github/`, affecting local test runs and
the other agent's work, to solve a problem that exists only on the runner.

- [ ] **Step 3: Validate and check formatting**

Run: `actionlint .github/workflows/ci.yml`

Run: `node node_modules/prettier/bin/prettier.cjs --check .github/workflows/ci.yml`

Expected: both clean.

- [ ] **Step 4: Commit, push and re-run**

Commit with `(fix): Let headless Chrome start on the runner`, push, then
`gh run watch --exit-status`.

Expected: the test step reports a `TOTAL: <n> SUCCESS` line for each project — 103 and 37 at the time of writing, possibly higher if the parallel feature work has added tests — and the run goes green.

---

### Task 4: `deploy.yml` — publish to GitHub Pages

**Files:**

- Create: `.github/workflows/deploy.yml`

**Interfaces:**

- Consumes: `.github/workflows/ci.yml` from Task 1, through `uses: ./.github/workflows/ci.yml`.
- Produces: a workflow named `Deploy to GitHub Pages` with jobs `gates`, `build` and `deploy`, and a
  deployment to the `github-pages` environment whose URL appears as the job's environment URL.

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/deploy.yml` with exactly this content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  gates:
    name: Quality gates
    uses: ./.github/workflows/ci.yml

  build:
    name: Build for Pages
    needs: gates
    runs-on: ubuntu-latest
    steps:
      - name: Check out the repository
        uses: actions/checkout@v7

      - name: Set up Node
        uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Configure Pages
        id: pages
        uses: actions/configure-pages@v6

      - name: Build the application
        run: npx ng build --base-href "${{ steps.pages.outputs.base_path }}/"

      - name: Add the SPA fallback
        run: cp dist/gallery-template/browser/index.html dist/gallery-template/browser/404.html

      - name: Upload the Pages artifact
        uses: actions/upload-pages-artifact@v5
        with:
          path: dist/gallery-template/browser

  deploy:
    name: Deploy to Pages
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

Two details worth understanding rather than copying blindly:

`steps.pages.outputs.base_path` comes from `configure-pages` and evaluates to `/xm-recruitment-task`
for this repository, so the base href becomes `/xm-recruitment-task/`. The spec proposed
`github.event.repository.name`; this is the same idea — never hardcode the path — expressed through
the action that already knows the answer, and it stays correct if the site ever moves to a custom
domain.

`cancel-in-progress` is `false` here, unlike in `ci.yml`. Interrupting a test run costs nothing;
interrupting a Pages publication leaves the site half-updated.

- [ ] **Step 2: Validate the syntax locally**

Run: `actionlint .github/workflows/deploy.yml`

Expected: no output, exit code 0. `actionlint` resolves the local reusable workflow reference, so a
typo in the path to `ci.yml` is caught here rather than on the runner.

- [ ] **Step 3: Check the formatting**

Run: `node node_modules/prettier/bin/prettier.cjs --check .github/workflows/deploy.yml`

Expected: `All matched files use Prettier code style!`

- [ ] **Step 4: Commit and push**

Commit `.github/workflows/deploy.yml` with the message
`(chore): Publish the application to GitHub Pages on merge`, then push.

- [ ] **Step 5: Confirm CI is still green with both workflows present**

Run: `gh run watch --exit-status`

Expected: the `CI` run on the pull request is green. `deploy.yml` does **not** run here — it only
triggers on push to `main` — so this step proves the gates, not the deployment. That proof comes in
Task 5.

- [ ] **Step 6: Mark the pull request ready for review**

Run: `gh pr ready`

---

### Task 5: Merge and verify the live deployment

**Files:** none — this task changes nothing in the repository.

**Interfaces:**

- Consumes: the workflows from Tasks 1 and 4, and a green pull request.
- Produces: a live site and the evidence that it works.

- [ ] **Step 1: Ask the repository owner to merge**

Do not merge or push to `main` yourself. Report that the pull request is green and ask for the
merge. The repository's convention is a merge commit (`--no-ff`), matching how `feature/photo-api`
was integrated as `9150f77`.

- [ ] **Step 2: Watch the deployment**

Run: `gh run watch --exit-status`

Expected: `Deploy to GitHub Pages` runs `gates`, then `build`, then `deploy`, and reports a page URL.

- [ ] **Step 3: Verify the published site loads**

Open `https://tomashpl.github.io/xm-recruitment-task/` in a browser.

Expected: the photostream renders with Material styling and picsum images. Broken styles or missing
assets mean the base href is wrong — check what `base_path` evaluated to in the build log.

- [ ] **Step 4: Verify the SPA fallback**

Open `https://tomashpl.github.io/xm-recruitment-task/favorites` directly, then navigate to a photo
and refresh the browser on `https://tomashpl.github.io/xm-recruitment-task/photos/<id>`.

Expected: both load the application rather than GitHub's 404 page. This is the only real test of the
`404.html` copy; nothing local can prove it.

- [ ] **Step 5: Check the browser console**

Expected: no asset 404s and no router errors. A 404 for a chunk or a stylesheet means the base href
is wrong even if the first page happened to render.

- [ ] **Step 6: Record the outcome**

Report the published URL, the deployment run, and what was verified. If any contingency task was
executed, say which and why — that is the part worth remembering next time.
