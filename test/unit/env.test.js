const path = require('path');
const os = require('os');
const { defaultOutputDir, detectPlatform } = require('../../percy/util/env');

describe('env util', () => {
  const originalEnv = { ...process.env };
  afterEach(() => { process.env = { ...originalEnv }; });

  describe('defaultOutputDir', () => {
    it('uses MAESTRO_OUTPUT_DIR when set', () => {
      process.env.MAESTRO_OUTPUT_DIR = '/tmp/custom';
      expect(defaultOutputDir()).toBe('/tmp/custom');
    });

    it('falls back to ~/.maestro/tests', () => {
      delete process.env.MAESTRO_OUTPUT_DIR;
      expect(defaultOutputDir()).toBe(path.join(os.homedir(), '.maestro', 'tests'));
    });
  });

  describe('detectPlatform', () => {
    it('honors MAESTRO_OS_NAME when set', () => {
      process.env.MAESTRO_OS_NAME = 'Web';
      expect(detectPlatform()).toBe('Web');
    });

    it('falls back to iOS when IOS_SIMULATOR_UDID is set', () => {
      delete process.env.MAESTRO_OS_NAME;
      delete process.env.ANDROID_SERIAL;
      process.env.IOS_SIMULATOR_UDID = 'abc-123';
      expect(detectPlatform()).toBe('iOS');
    });

    it('falls back to Android by default', () => {
      delete process.env.MAESTRO_OS_NAME;
      delete process.env.IOS_SIMULATOR_UDID;
      delete process.env.ANDROID_SERIAL;
      expect(detectPlatform()).toBe('Android');
    });
  });
});
