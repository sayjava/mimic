import { logger, parse } from './deps.ts';
import { MimicConfig, startServers } from './start.ts';

const flags = parse(Deno.args);

if (flags.h || flags.help) {
	logger.info('Help me out');
	Deno.exit(0);
}

const config: MimicConfig = {
  serverPort: parseInt(
    flags.serverPort || flags.s || flags["server-port"] || "8080",
    10
  ),
  mocksDirectory: String(flags.d || flags.mocksDirectory || "mocks"),
  tlsCertFile: flags.tlsCert,
  tlsKeyFile: flags.tlsKey,
  autoProxy: true,
};
logger.info('**** Mimic Server ****');
await startServers(config);
