# @percy/maestro-web

[![npm version](https://img.shields.io/npm/v/@percy/maestro-web.svg)](https://www.npmjs.com/package/@percy/maestro-web)

Percy SDK for [Maestro](https://maestro.dev) **web flows** — visual testing powered by full DOM capture.

Multi-browser, multi-width, cross-origin iframes, regions, AI analysis — identical feature surface to [`@percy/selenium-webdriver`](https://github.com/percy/percy-selenium-javascript) and [`@percy/playwright`](https://github.com/percy/percy-playwright).

## Install

```sh
npm install --save-dev @percy/maestro-web @percy/cli
```

Install the [Maestro CLI](https://docs.maestro.dev) separately (`curl -Ls "https://get.maestro.mobile.dev" | bash`).

## Usage

Same shape as `percy exec -- playwright test`, just swap `percy exec` for `percy-maestro-web exec`:

```sh
export PERCY_TOKEN="<your-web-project-token>"
percy-maestro-web exec -- maestro test flow.yaml
```

Inside the YAML flow, call Percy at each capture point via `runScript:`:

```yaml
url: https://example.com
---
- launchApp
- runScript:
    file: ../node_modules/@percy/maestro-web/scripts/snapshot.js
    env:
      NAME: "Home"
```

That's the minimum — just `NAME`. Widths, minHeight, percyCSS, etc. come from `.percy.yml` at your project root (same config file Selenium/Playwright users maintain):

```yaml
# .percy.yml
version: 2
snapshot:
  widths: [375, 1280]
  minHeight: 1024
```

Percy renders each snapshot in Chrome / Safari / Firefox / Edge across every configured width — same build shape as Selenium/Playwright.

### Per-snapshot overrides

Every option below is an `env:` key on the `runScript` block. Names are case-insensitive and accepted with or without the `PERCY_SNAPSHOT_` prefix (`NAME` and `PERCY_SNAPSHOT_NAME` both work).

| Env var | Maps to | Notes |
|---|---|---|
| `NAME` | `name` | Required |
| `WIDTHS` | `widths` | Comma-separated, e.g. `"375,1280"` |
| `MIN_HEIGHT` | `minHeight` | Minimum render height in pixels |
| `PERCY_CSS` | `percyCSS` | Inline CSS injected at render time |
| `SCOPE` | `scope` | CSS selector to scope the snapshot to a subtree |
| `ENABLE_JS` | `enableJavaScript` | `"true"` to run JS at render time |
| `TEST_CASE` | `testCase` | Groups snapshots in the Percy review "Test Cases" panel |
| `LABELS` | `labels` | Comma-separated label chips (e.g. `"smoke,critical-path"`) |
| `REGIONS` | `regions` | JSON array of unified regions — preferred over legacy ignoreRegions |
| `IGNORE_REGIONS` | `ignoreRegions` | Legacy, snapshot-level — prefer `REGIONS` |
| `CONSIDER_REGIONS` | `considerRegions` | Legacy |
| `SYNC` | `sync` | `"true"` to block until the build finalizes |
| `RESPONSIVE` | `responsiveSnapshotCapture` | `"true"` to re-capture DOM at each viewport |

Project-level defaults you set in `.percy.yml` (widths, minHeight, percyCSS, etc.) apply automatically — per-snapshot `env:` overrides win when both are present.

### `createRegion()` helper

Build regions programmatically in Node code (matches `percy-playwright`'s exact API):

```js
const { createRegion } = require('@percy/maestro-web');

const regions = [
  createRegion({ boundingBox: { x: 0, y: 0, width: 1280, height: 80 } }),
  createRegion({ elementXpath: '//div[@id="ad-banner"]' }),
  createRegion({ elementCSS: '#timestamp', algorithm: 'layout' }),
  createRegion({
    boundingBox: { x: 0, y: 0, width: 1280, height: 600 },
    algorithm: 'intelliignore',
    carouselsEnabled: true, bannersEnabled: true, adsEnabled: true
  })
];

// Then use in a flow:
process.env.PERCY_SNAPSHOT_REGIONS = JSON.stringify(regions);
```

## CLI reference

```sh
percy-maestro-web exec -- <command>      # Run any command with Percy + capture server
percy-maestro-web serve                  # (Advanced) Start only the capture server
```

## Parity with `@percy/playwright`

| | Playwright | Maestro (web) |
|---|---|---|
| DOM capture via `@percy/dom` | ✅ | ✅ |
| Multi-browser render | ✅ | ✅ |
| Multi-width render | ✅ | ✅ |
| Responsive DOM capture | ✅ | ✅ |
| Cross-origin iframe serialization | ✅ | ✅ |
| Cookies captured | ✅ | ✅ |
| `regions` / `createRegion()` | ✅ | ✅ |
| `testCase` / `labels` | ✅ | ✅ |
| `.percy.yml` defaults | ✅ | ✅ |
| Project-level config applies to all snapshots | ✅ | ✅ |
| `minHeight` / `percyCSS` / `scope` / `enableJS` | ✅ | ✅ |
| `sync` / `discovery` / `additionalSnapshots` | ✅ | ✅ |

## Why the call site looks different from Playwright / Selenium

Playwright/Selenium tests are JavaScript — users can call `await percySnapshot(page, name)` directly because they have a JS process and a live `page` object. Maestro tests are **declarative YAML** with no user-written JavaScript. The only extension point Maestro YAML provides for parameterized calls is `runScript: file: + env:`, which is a 4-line block. That's a hard syntactic floor from Maestro — not something the SDK can shrink further. To change it, Maestro upstream would need to add a plugin API that registers third-party commands (e.g. `- percySnapshot: "Home"`).

Everything else — the SDK behavior, the Percy payload, the rendering, the review UI, `.percy.yml` config, region algorithms, AI analysis — is identical.

## Architecture

```
percy-maestro-web exec -- maestro test flow.yaml
  │
  ├─ percy-maestro-web process starts capture server on :5339
  │     └─ CDP ↔ Chromium  (discovered via DevToolsActivePort file)
  │            runs PercyDOM.serialize() in page context,
  │            captures cookies via Network.getAllCookies,
  │            enumerates cross-origin iframes via Target.getTargets,
  │            merges .percy.yml defaults under per-call options
  │
  └─ spawns `percy exec -- maestro test flow.yaml` as subprocess
        ├─ Percy server (:5338)  starts build lifecycle
        └─ maestro test runs the YAML flow
              └─ runScript: snapshot.js  →  http.post to :5339  →  :5338
```

## License

MIT
