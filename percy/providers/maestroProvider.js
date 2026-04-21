const path = require('path');
const utils = require('@percy/sdk-utils');
const { scanOutputDir } = require('../scanner/outputDirScanner');
const { resolveDeviceMetadata } = require('../metadata');
const log = require('../util/log');
const { defaultOutputDir } = require('../util/env');

class MaestroProvider {
  constructor(options = {}) {
    this.options = options;
    this.outputDir = options.dir || defaultOutputDir();
  }

  async snapshot(name, options = {}) {
    const pngPath = await this._latestScreenshot();
    if (!pngPath) {
      log.warn(`[${name}] no screenshot found in ${this.outputDir}`);
      return;
    }

    const tag = await resolveDeviceMetadata(options);
    const tile = { filepath: pngPath, fullscreen: false, statusBarHeight: 0, navBarHeight: 0 };

    return utils.postSnapshot({
      name,
      tag,
      tiles: [tile],
      ignoreRegions: options.ignoreRegions || []
    });
  }

  async _latestScreenshot() {
    const pngs = await scanOutputDir(this.outputDir);
    if (!pngs.length) return null;
    return pngs[pngs.length - 1].path;
  }
}

async function uploadFromOutputDir(options = {}) {
  const dir = options.dir || defaultOutputDir();
  const pngs = await scanOutputDir(dir);

  if (!pngs.length) {
    log.warn(`no screenshots found in ${dir}`);
    return;
  }

  const tag = await resolveDeviceMetadata(options);
  const url = options.url || 'http://maestro.local/';
  log.info(`uploading ${pngs.length} snapshot(s) to Percy`);

  for (const png of pngs) {
    const name = options.name || path.basename(png.path, '.png');
    const tile = { filepath: png.path, fullscreen: false, statusBarHeight: 0, navBarHeight: 0 };
    try {
      await utils.postSnapshot({ name, url, tag, tiles: [tile] });
      log.debug(`[${name}] uploaded`);
    } catch (e) {
      log.error(`[${name}] upload failed: ${e.message}`);
    }
  }
}

module.exports = { MaestroProvider, uploadFromOutputDir };
