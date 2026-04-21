// Helper for building ignore / consider / layout region objects.
// Matches the percy-playwright `createRegion()` signature exactly so users
// familiar with that SDK can use the same call.
//
// Example:
//   const { createRegion } = require('@percy/maestro');
//   const regions = [
//     createRegion({ boundingBox: { top: 0, left: 0, width: 100, height: 80 } }),
//     createRegion({ elementXpath: '//div[@id="ad-banner"]', algorithm: 'ignore' }),
//     createRegion({ elementCSS: '#timestamp', algorithm: 'layout' }),
//     createRegion({
//       boundingBox: { top: 0, left: 0, width: 100, height: 80 },
//       algorithm: 'intelliignore',
//       carouselsEnabled: true, bannersEnabled: true, adsEnabled: true
//     })
//   ];

function createRegion({
  boundingBox = null,
  elementXpath = null,
  elementCSS = null,
  padding = null,
  algorithm = 'ignore',
  diffSensitivity = null,
  imageIgnoreThreshold = null,
  carouselsEnabled = null,
  bannersEnabled = null,
  adsEnabled = null,
  diffIgnoreThreshold = null
} = {}) {
  const elementSelector = {};
  if (boundingBox) elementSelector.boundingBox = boundingBox;
  if (elementXpath) elementSelector.elementXpath = elementXpath;
  if (elementCSS) elementSelector.elementCSS = elementCSS;

  const region = {
    algorithm,
    elementSelector
  };

  if (padding !== null && padding !== undefined) {
    region.padding = padding;
  }

  const configuration = {};
  if (['standard', 'intelliignore'].includes(algorithm)) {
    if (diffSensitivity !== null) configuration.diffSensitivity = diffSensitivity;
    if (imageIgnoreThreshold !== null) configuration.imageIgnoreThreshold = imageIgnoreThreshold;
    if (carouselsEnabled !== null) configuration.carouselsEnabled = carouselsEnabled;
    if (bannersEnabled !== null) configuration.bannersEnabled = bannersEnabled;
    if (adsEnabled !== null) configuration.adsEnabled = adsEnabled;
  }
  if (Object.keys(configuration).length > 0) {
    region.configuration = configuration;
  }

  const assertion = {};
  if (diffIgnoreThreshold !== null) assertion.diffIgnoreThreshold = diffIgnoreThreshold;
  if (Object.keys(assertion).length > 0) {
    region.assertion = assertion;
  }

  return region;
}

module.exports = { createRegion };
