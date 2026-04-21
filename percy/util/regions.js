// Helper for constructing region objects for ignoreRegions / considerRegions.
// Mirrors the createRegion() helper from percy-playwright's public API.
//
// Example:
//   const { createRegion } = require('@percy/maestro');
//   const regions = [
//     createRegion({ top: 0, right: 0, bottom: 100, left: 0, algorithm: 'ignore' }),
//     createRegion({ elementXpath: '//div[@id="ad-banner"]', algorithm: 'ignore' }),
//   ];
//   // Pass via env: PERCY_SNAPSHOT_IGNORE_REGIONS: JSON.stringify(regions)

function createRegion({
  top,
  right,
  bottom,
  left,
  elementXpath,
  elementCSS,
  padding,
  algorithm = 'ignore',
  configuration = {},
  assertion = {}
} = {}) {
  const region = { algorithm };

  if (elementXpath) {
    region.elementXpath = elementXpath;
  } else if (elementCSS) {
    region.elementCSS = elementCSS;
  } else if ([top, right, bottom, left].some(v => v !== undefined)) {
    region.coOrdinates = {
      top: top ?? 0,
      right: right ?? 0,
      bottom: bottom ?? 0,
      left: left ?? 0
    };
  } else {
    throw new Error('createRegion requires one of: coordinates (top/right/bottom/left), elementXpath, or elementCSS');
  }

  if (padding !== undefined) region.padding = padding;
  if (Object.keys(configuration).length) region.configuration = configuration;
  if (Object.keys(assertion).length) region.assertion = assertion;

  return region;
}

module.exports = { createRegion };
