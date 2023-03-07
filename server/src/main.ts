import { logger, MimicConfig, parse } from './deps.ts';
import { startServer } from './start.ts';

const flags = parse(Deno.args);

if (flags.h || flags.help) {
	logger.info('Help me out');
	Deno.exit(0);
}

const {
	MIMIC_PORT = '8080',
	MIMIC_MOCKS_DIRECTORY = 'mocks',
	MIMIC_PARTIALS_DIRECTORY = 'partials',
	MIMIC_ENABLE_SSL = false,
	MIMIC_STORAGE_TYPE = 'memory',
	MIMIC_GRAPHQL_SCHEMA,
	MIMIC_TLS_CERT,
	MIMIC_TLS_KEY,
} = Deno.env.toObject();

const config: MimicConfig = {
	port: parseInt(
		flags.port || flags.p || MIMIC_PORT,
		10,
	),
	mocksDirectory: String(
		flags.d || flags.mocks || MIMIC_MOCKS_DIRECTORY,
	),
	tlsCertFile: flags.tlsCert || MIMIC_TLS_CERT,
	tlsKeyFile: flags.tlsKey || MIMIC_TLS_KEY,
	partialsDirectory: String(
		flags.partials || MIMIC_PARTIALS_DIRECTORY || 'partials',
	),
	enableSSL: flags.ssl || MIMIC_ENABLE_SSL === 'true',
	storageType: flags.storage || MIMIC_STORAGE_TYPE,
	graphqlSchema: MIMIC_GRAPHQL_SCHEMA,
};

logger.info('**** Mimic Server ****');
startServer(config);

Deno.addSignalListener('SIGINT', () => {
	logger.info('Exited');
	Deno.exit(0);
});
