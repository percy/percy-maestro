const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const { scanOutputDir } = require('../../percy/scanner/outputDirScanner');

describe('outputDirScanner', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'maestro-scan-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('returns empty array when dir does not exist', async () => {
    const result = await scanOutputDir(path.join(tmpDir, 'missing'));
    expect(result).toEqual([]);
  });

  it('finds PNGs recursively and sorts by mtime', async () => {
    await fs.mkdir(path.join(tmpDir, 'flow-a'), { recursive: true });
    await fs.mkdir(path.join(tmpDir, 'flow-b'), { recursive: true });
    await fs.writeFile(path.join(tmpDir, 'flow-a', 'one.png'), 'x');
    await new Promise(resolve => setTimeout(resolve, 10));
    await fs.writeFile(path.join(tmpDir, 'flow-b', 'two.PNG'), 'x');
    await fs.writeFile(path.join(tmpDir, 'flow-a', 'ignored.txt'), 'x');

    const result = await scanOutputDir(tmpDir);
    expect(result.map(r => r.name)).toEqual(['one.png', 'two.PNG']);
  });
});
