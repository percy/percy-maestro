const { execFile } = require('child_process');
const { promisify } = require('util');
const exec = promisify(execFile);

async function androidMetadata(options = {}) {
  const serial = options.serial || process.env.ANDROID_SERIAL;
  const args = (cmd) => serial ? ['-s', serial, 'shell', ...cmd] : ['shell', ...cmd];

  const [name, osVersion, sizeRaw, orientationRaw] = await Promise.all([
    safe(() => run('adb', args(['getprop', 'ro.product.model']))),
    safe(() => run('adb', args(['getprop', 'ro.build.version.release']))),
    safe(() => run('adb', args(['wm', 'size']))),
    safe(() => run('adb', args(['dumpsys', 'input'])))
  ]);

  const { width, height } = parseSize(sizeRaw);
  const orientation = parseOrientation(orientationRaw, width, height);

  return {
    name: name || 'Android Device',
    osName: 'Android',
    osVersion: osVersion || '',
    width,
    height,
    orientation
  };
}

function parseSize(raw) {
  const match = (raw || '').match(/Physical size:\s*(\d+)x(\d+)/);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : { width: 0, height: 0 };
}

function parseOrientation(raw, width, height) {
  const rotMatch = (raw || '').match(/SurfaceOrientation:\s*(\d)/);
  if (rotMatch) return (rotMatch[1] === '1' || rotMatch[1] === '3') ? 'landscape' : 'portrait';
  return width > height ? 'landscape' : 'portrait';
}

async function run(cmd, args) {
  const { stdout } = await exec(cmd, args);
  return stdout.trim();
}

async function safe(fn) {
  try { return await fn(); } catch { return null; }
}

module.exports = { androidMetadata };
