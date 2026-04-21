const { MaestroProvider, uploadFromOutputDir } = require('./percy/providers/maestroProvider');
const { createRegion } = require('./percy/util/regions');
const utils = require('@percy/sdk-utils');
const log = require('./percy/util/log');

const sdkPkg = require('./package.json');
const CLIENT_INFO = `${sdkPkg.name}/${sdkPkg.version}`;
const ENV_INFO = `maestro/${process.env.MAESTRO_VERSION || 'unknown'}`;

async function percyMaestroSnapshot(name, options = {}) {
  if (!name) throw new Error('The `name` argument is required.');

  if (!await utils.isPercyEnabled()) {
    log.info(`[${name}] percy is disabled -> skipping`);
    return;
  }

  const provider = new MaestroProvider(options);
  return provider.snapshot(name, options);
}

module.exports = percyMaestroSnapshot;
module.exports.percyMaestroSnapshot = percyMaestroSnapshot;
module.exports.uploadFromOutputDir = uploadFromOutputDir;
module.exports.createRegion = createRegion;
module.exports.CLIENT_INFO = CLIENT_INFO;
module.exports.ENV_INFO = ENV_INFO;
