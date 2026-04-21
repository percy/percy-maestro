#!/usr/bin/env node

const { program } = require('commander');
const { MaestroProvider, uploadFromOutputDir } = require('./providers/maestroProvider');
const log = require('./util/log');
const pkg = require('../package.json');

program
  .name('percy-maestro')
  .description('Percy SDK for Maestro — capture Percy snapshots from Maestro YAML flows')
  .version(pkg.version);

program
  .command('snapshot <name>')
  .description('Capture an explicit named Percy snapshot (for use from a Maestro runScript step)')
  .option('--device-name <name>', 'Device name (defaults to $MAESTRO_DEVICE_NAME)')
  .option('--orientation <orientation>', 'portrait|landscape')
  .option('--ignore-regions <json>', 'JSON array of ignore regions')
  .action(async (name, opts) => {
    try {
      const provider = new MaestroProvider(opts);
      await provider.snapshot(name, opts);
    } catch (e) {
      log.error(`snapshot failed: ${e.message}`);
      process.exit(1);
    }
  });

program
  .command('upload')
  .description('(Screenshot mode) Scan a Maestro output dir and upload every PNG to Percy. Use for mobile flows or when DOM capture is not needed.')
  .option('-d, --dir <path>', 'Maestro output dir (defaults to ./.maestro/tests/latest)')
  .option('--device-name <name>', 'Device name for all uploaded screenshots')
  .option('--os-name <name>', 'Android|iOS|Web (default: auto-detect via adb/xcrun)')
  .option('--url <url>', 'Page URL for web snapshots (required for Web Percy projects)')
  .action(async (opts) => {
    try {
      await uploadFromOutputDir(opts);
    } catch (e) {
      log.error(`upload failed: ${e.message}`);
      process.exit(1);
    }
  });

program
  .command('serve')
  .description('(DOM-capture mode) Start the Percy capture server — connects to Maestro\'s Chromium via CDP and handles DOM snapshot requests from runScript steps. Use for web flows to get full multi-browser/multi-width support.')
  .option('--port <port>', 'Port to listen on (default: 5339)', (v) => Number(v), 5339)
  .action(async (opts) => {
    try {
      const { startServer } = require('./server/captureServer');
      await startServer({ port: opts.port });
      process.on('SIGTERM', () => process.exit(0));
      process.on('SIGINT', () => process.exit(0));
    } catch (e) {
      log.error(`serve failed: ${e.message}`);
      process.exit(1);
    }
  });

program.parseAsync(process.argv);
