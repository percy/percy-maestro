const { execFile } = require('child_process');
const { promisify } = require('util');
const exec = promisify(execFile);

async function iosMetadata(options = {}) {
  const udid = options.udid || process.env.IOS_SIMULATOR_UDID;
  const listRaw = await safe(() => run('xcrun', ['simctl', 'list', 'devices', 'booted', '-j']));
  const booted = parseBooted(listRaw, udid);

  return {
    name: booted?.name || 'iOS Device',
    osName: 'iOS',
    osVersion: booted?.runtime || '',
    width: 0,
    height: 0,
    orientation: 'portrait'
  };
}

function parseBooted(json, udid) {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    for (const [runtime, list] of Object.entries(parsed.devices || {})) {
      for (const dev of list) {
        if (dev.state === 'Booted' && (!udid || dev.udid === udid)) {
          return { name: dev.name, runtime: runtime.split('.').pop().replace(/-/g, '.') };
        }
      }
    }
  } catch { /* ignore parse errors */ }
  return null;
}

async function run(cmd, args) {
  const { stdout } = await exec(cmd, args);
  return stdout.trim();
}

async function safe(fn) {
  try { return await fn(); } catch { return null; }
}

module.exports = { iosMetadata };
