const os = require('os');
const path = require('path');

function defaultOutputDir() {
  return process.env.MAESTRO_OUTPUT_DIR || path.join(os.homedir(), '.maestro', 'tests');
}

function detectPlatform() {
  const fromEnv = process.env.MAESTRO_OS_NAME;
  if (fromEnv) return fromEnv;
  if (process.env.IOS_SIMULATOR_UDID) return 'iOS';
  if (process.env.ANDROID_SERIAL) return 'Android';
  return 'Android';
}

module.exports = { defaultOutputDir, detectPlatform };
