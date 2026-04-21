const { androidMetadata } = require('./androidMetadata');
const { iosMetadata } = require('./iosMetadata');
const { detectPlatform } = require('../util/env');

// Returns the App Percy `tag` payload:
//   { name, osName, osVersion, width, height, orientation }
async function resolveDeviceMetadata(options = {}) {
  // Priority: explicit opts → env vars → platform probe (adb/xcrun)
  const explicit = readExplicit(options);
  if (isComplete(explicit)) return explicit;

  const platform = options.osName || detectPlatform();
  const probed = platform === 'iOS'
    ? await iosMetadata(options)
    : await androidMetadata(options);

  return { ...probed, ...explicit };
}

function readExplicit(options) {
  const env = process.env;
  return stripUndefined({
    name: options.deviceName || env.MAESTRO_DEVICE_NAME,
    osName: options.osName || env.MAESTRO_OS_NAME,
    osVersion: options.osVersion || env.MAESTRO_OS_VERSION,
    width: options.width ? Number(options.width) : undefined,
    height: options.height ? Number(options.height) : undefined,
    orientation: options.orientation || env.MAESTRO_ORIENTATION
  });
}

function isComplete(tag) {
  return tag.name && tag.osName && tag.osVersion && tag.width && tag.height && tag.orientation;
}

function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

module.exports = { resolveDeviceMetadata };
