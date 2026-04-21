# @percy/maestro

[![npm version](https://img.shields.io/npm/v/@percy/maestro.svg)](https://www.npmjs.com/package/@percy/maestro)

Maestro client library for visual testing with [Percy](https://percy.io). Supports Maestro web flows with full DOM capture (multi-browser, multi-width rendering like `percy-selenium` / `percy-playwright`) and Maestro mobile flows via the screenshot-upload path (like `percy-appium-*`).

## Install

```sh
npm install --save-dev @percy/maestro @percy/cli
```

Also install the [Maestro CLI](https://docs.maestro.dev) separately on your machine.

## Usage — Web flows (DOM capture, full feature parity)

For Maestro web flows (`url: https://...` in YAML), use the DOM-capture path. This renders in Chrome/Safari/Firefox/Edge at every configured width, same as Selenium/Playwright SDKs.

### 1. Package scripts

```json
{
  "scripts": {
    "test-web": "percy exec -- bash -c 'percy-maestro serve & SRVPID=$!; sleep 2; maestro test flows/your-flow.yaml; kill $SRVPID; wait 2>/dev/null'"
  }
}
```

The `percy-maestro serve` command starts a local capture server that connects to Maestro's Chromium instance via CDP, serializes DOM with `@percy/dom`, and posts it to the Percy server that `percy exec` boots.

### 2. YAML flow

```yaml
url: https://example.com
---
- launchApp
- runScript:
    file: ../node_modules/@percy/maestro/scripts/snapshot.js
    env:
      PERCY_SNAPSHOT_NAME: "Home"
      PERCY_SNAPSHOT_WIDTHS: "375,1280"

- tapOn: "Sign in"
- runScript:
    file: ../node_modules/@percy/maestro/scripts/snapshot.js
    env:
      PERCY_SNAPSHOT_NAME: "Sign in page"
      PERCY_SNAPSHOT_WIDTHS: "375,1280"
```

### 3. Environment

```sh
export PERCY_TOKEN="your-web-project-token"
```

### 4. Run

```sh
npm run test-web
```

Build appears on your Percy dashboard with full diff review across browsers and widths.

### Supported options (via `env:` block of `runScript:`)

| Env var | Maps to | Notes |
|---|---|---|
| `PERCY_SNAPSHOT_NAME` | `name` | Required |
| `PERCY_SNAPSHOT_WIDTHS` | `widths` | Comma-separated (e.g. `"375,1280"`) |
| `PERCY_SNAPSHOT_MIN_HEIGHT` | `minHeight` | Minimum render height |
| `PERCY_SNAPSHOT_PERCY_CSS` | `percyCSS` | Inline CSS injected at render time |
| `PERCY_SNAPSHOT_SCOPE` | `scope` | CSS selector to scope the snapshot |
| `PERCY_SNAPSHOT_ENABLE_JS` | `enableJavaScript` | `"true"` to run JS at render |
| `PERCY_SNAPSHOT_IGNORE_REGIONS` | `ignoreRegions` | JSON array of region objects |
| `PERCY_SNAPSHOT_CONSIDER_REGIONS` | `considerRegions` | JSON array |
| `PERCY_SNAPSHOT_SYNC` | `sync` | `"true"` to wait for build finalize |
| `PERCY_SNAPSHOT_RESPONSIVE` | `responsiveSnapshotCapture` | `"true"` to re-capture DOM per-width |

### Ignore / Consider regions

Use the `createRegion()` helper to build region objects in JS, then serialize them:

```js
const { createRegion } = require('@percy/maestro');

const ignoreRegions = [
  createRegion({ top: 0, right: 0, bottom: 100, left: 0 }),               // coord-based
  createRegion({ elementXpath: '//div[@id="ad-banner"]' }),              // XPath
  createRegion({ elementCSS: '#timestamp', algorithm: 'ignore' })        // CSS
];

process.env.PERCY_SNAPSHOT_IGNORE_REGIONS = JSON.stringify(ignoreRegions);
```

## Usage — Mobile flows (screenshot upload)

For native Android / iOS flows, use the `upload` subcommand to post PNGs from Maestro's output dir to App Percy.

### YAML

```yaml
appId: com.example.app
---
- launchApp:
    clearState: true
- takeScreenshot:
    path: ./screenshots/home
- tapOn: "Login"
- takeScreenshot:
    path: ./screenshots/login
```

### Run

```sh
percy exec -- bash -c 'maestro test flow.yaml && percy-maestro upload --dir ./screenshots'
```

The SDK auto-detects Android/iOS via `adb` / `xcrun simctl` and attaches device metadata (model, OS version, screen dims, orientation).

## CLI

```sh
percy-maestro serve [--port 5339]                  # Start DOM-capture server (web flows)
percy-maestro upload [--dir <path>] [--url <url>]  # Upload PNGs (mobile flows)
percy-maestro snapshot <name> [options]            # Explicit snapshot (runScript escape hatch)
```

## Architecture

**Web flow (DOM capture)**
```
yarn test-web
  → percy exec
    ├─ Percy server (:5338)                      starts the build lifecycle
    ├─ percy-maestro serve (:5339)               aux capture server
    │     └─ CDP → Chromium                     via DevToolsActivePort discovery
    │     └─ PercyDOM.serialize() → :5338
    └─ maestro test
          └─ runScript → http.post → :5339 → :5338
```

**Mobile flow (screenshot upload)**
```
percy exec -- maestro test flow.yaml
  1. maestro test runs, writes PNGs to ./screenshots/
  2. percy-maestro upload walks the dir, attaches adb/xcrun metadata
  3. Uploads to App Percy via @percy/sdk-utils
```

## License

MIT
