const { createRegion } = require('./percy/util/regions');

const sdkPkg = require('./package.json');
const CLIENT_INFO = `${sdkPkg.name}/${sdkPkg.version}`;
const ENV_INFO = `maestro/${process.env.MAESTRO_VERSION || 'unknown'}`;

module.exports.createRegion = createRegion;
module.exports.CLIENT_INFO = CLIENT_INFO;
module.exports.ENV_INFO = ENV_INFO;
