#!/usr/bin/env node

const { program } = require('commander');
const log = require('./util/log');
const pkg = require('../package.json');

program
  .name('percy-maestro-web')
  .description('Percy SDK for Maestro web flows — capture Percy snapshots from Maestro YAML flows')
  .version(pkg.version);

program
  .command('serve')
  .description('(Advanced) Start only the Percy capture server — useful if you want to manage percy exec separately. Most users should use `percy-maestro-web exec` instead.')
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

program
  .command('exec')
  .description('Run `maestro test` with Percy visual testing. Drop-in replacement for `percy exec` that also starts the DOM-capture server for Maestro web flows.')
  .option('--capture-port <port>', 'Port for the capture server (default: 5339)', (v) => Number(v), 5339)
  .allowUnknownOption()
  .action(async (opts) => {
    const { spawn } = require('child_process');
    const { startServer } = require('./server/captureServer');

    // Find args after `--`; commander strips them, so read from argv
    const sep = process.argv.indexOf('--');
    if (sep === -1 || sep === process.argv.length - 1) {
      log.error('usage: percy-maestro-web exec -- <command> [args...]');
      process.exit(1);
    }
    const cmdArgs = process.argv.slice(sep + 1);

    let server;
    try {
      server = await startServer({ port: opts.capturePort });
    } catch (e) {
      log.error(`failed to start capture server: ${e.message}`);
      process.exit(1);
    }

    const child = spawn('percy', ['exec', '--', ...cmdArgs], { stdio: 'inherit' });
    const cleanup = (code) => {
      try { server.close(); } catch { /* ignore */ }
      process.exit(code ?? 0);
    };
    child.on('exit', cleanup);
    process.on('SIGTERM', () => { child.kill('SIGTERM'); });
    process.on('SIGINT', () => { child.kill('SIGINT'); });
  });

program.parseAsync(process.argv);
