// Maestro runScript — posts a DOM snapshot request to the percy-maestro
// capture server running on localhost:5339. The server connects to Maestro's
// Chromium via CDP, serializes DOM with @percy/dom, and posts it to the
// Percy server started by `percy exec`.
//
// YAML usage (note: env values are exposed as DIRECT variables, not env.VAR):
//   - runScript:
//       file: ../node_modules/@percy/maestro/scripts/snapshot.js
//       env:
//         PERCY_SNAPSHOT_NAME: "Home screen"
//         PERCY_SNAPSHOT_WIDTHS: "375,1280"       # optional
//         PERCY_SNAPSHOT_MIN_HEIGHT: "1024"       # optional
//         PERCY_SNAPSHOT_PERCY_CSS: ""            # optional
//         PERCY_SNAPSHOT_ENABLE_JS: "false"       # optional
//         PERCY_SNAPSHOT_SCOPE: ""                # optional CSS selector

var snapshotName = (typeof PERCY_SNAPSHOT_NAME !== 'undefined' && PERCY_SNAPSHOT_NAME) || 'unnamed';

var options = {};
if (typeof PERCY_SNAPSHOT_WIDTHS !== 'undefined' && PERCY_SNAPSHOT_WIDTHS) {
  options.widths = PERCY_SNAPSHOT_WIDTHS
    .split(',').map(function (w) { return Number(w.trim()); });
}
if (typeof PERCY_SNAPSHOT_MIN_HEIGHT !== 'undefined' && PERCY_SNAPSHOT_MIN_HEIGHT) {
  options.minHeight = Number(PERCY_SNAPSHOT_MIN_HEIGHT);
}
if (typeof PERCY_SNAPSHOT_PERCY_CSS !== 'undefined' && PERCY_SNAPSHOT_PERCY_CSS) {
  options.percyCSS = PERCY_SNAPSHOT_PERCY_CSS;
}
if (typeof PERCY_SNAPSHOT_SCOPE !== 'undefined' && PERCY_SNAPSHOT_SCOPE) {
  options.scope = PERCY_SNAPSHOT_SCOPE;
}
if (typeof PERCY_SNAPSHOT_ENABLE_JS !== 'undefined' && PERCY_SNAPSHOT_ENABLE_JS === 'true') {
  options.enableJavaScript = true;
}
// Regions are JSON strings — e.g. '[{"top":0,"left":0,"bottom":100,"right":100}]'
if (typeof PERCY_SNAPSHOT_IGNORE_REGIONS !== 'undefined' && PERCY_SNAPSHOT_IGNORE_REGIONS) {
  try { options.ignoreRegions = JSON.parse(PERCY_SNAPSHOT_IGNORE_REGIONS); } catch (e) {}
}
if (typeof PERCY_SNAPSHOT_CONSIDER_REGIONS !== 'undefined' && PERCY_SNAPSHOT_CONSIDER_REGIONS) {
  try { options.considerRegions = JSON.parse(PERCY_SNAPSHOT_CONSIDER_REGIONS); } catch (e) {}
}
if (typeof PERCY_SNAPSHOT_SYNC !== 'undefined' && PERCY_SNAPSHOT_SYNC === 'true') {
  options.sync = true;
}
if (typeof PERCY_SNAPSHOT_RESPONSIVE !== 'undefined' && PERCY_SNAPSHOT_RESPONSIVE === 'true') {
  options.responsiveSnapshotCapture = true;
}
if (typeof PERCY_SNAPSHOT_TEST_CASE !== 'undefined' && PERCY_SNAPSHOT_TEST_CASE) {
  options.testCase = PERCY_SNAPSHOT_TEST_CASE;
}
if (typeof PERCY_SNAPSHOT_LABELS !== 'undefined' && PERCY_SNAPSHOT_LABELS) {
  options.labels = PERCY_SNAPSHOT_LABELS;
}

var response = http.post('http://localhost:5339/snapshot', {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: snapshotName, options: options })
});

output.percySnapshotStatus = response.ok ? 'uploaded' : 'failed';
output.percySnapshotCode = response.status;
