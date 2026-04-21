const fs = require('fs').promises;
const path = require('path');

// Maestro writes screenshots from `takeScreenshot:` into its test output dir.
// Default layout: ~/.maestro/tests/<run-id>/<flow>/screenshots/*.png
// User can override via --test-output-dir / testOutputDir in workspace config.
async function scanOutputDir(dir) {
  const pngs = [];
  await walk(dir, pngs);
  pngs.sort((a, b) => a.mtimeMs - b.mtimeMs);
  return pngs;
}

async function walk(dir, acc) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (e) {
    if (e.code === 'ENOENT') return;
    throw e;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, acc);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      const stat = await fs.stat(full);
      acc.push({ path: full, name: entry.name, mtimeMs: stat.mtimeMs });
    }
  }
}

module.exports = { scanOutputDir };
