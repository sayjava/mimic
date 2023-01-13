import { logger, parse } from './deps.ts';
import { MimicConfig, startServers } from './start.ts';

const flags = parse(Deno.args);

if (flags.h || flags.help) {
	logger.info('Help me out');
	Deno.exit(0);
}

const {
	MIMIC_PORT = '8080',
	MIMIC_MOCKS_DIRECTORY = 'mocks',
	MIMIC_TLS_CERT,
	MIMIC_TLS_KEY,
} = Deno.env.toObject();

const config: MimicConfig = {
	port: parseInt(
		flags.port || flags.s || flags['server-port'] || MIMIC_PORT,
		10,
	),
	mocksDirectory: String(
		flags.d || flags.mocksDirectory || MIMIC_MOCKS_DIRECTORY,
	),
	tlsCertFile: flags.tlsCert || MIMIC_TLS_CERT,
	tlsKeyFile: flags.tlsKey || MIMIC_TLS_KEY,
};

logger.info('**** Mimic Server ****');
startServers(config);

Deno.addSignalListener('SIGINT', () => {
	logger.info('Exited');
	Deno.exit(0);
});
