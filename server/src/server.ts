import { parse } from './deps.ts';
import { MimicConfig, startServers } from './start.ts';

const flags = parse(Deno.args);

if (flags.h || flags.help) {
	console.log('Help me out');
	Deno.exit(0);
}

const config: MimicConfig = {
	serverPort: parseInt(
		flags.serverPort || flags.s || flags['server-port'] || '8080',
		10,
	),
	mocksDirectory: String(flags.d || flags.mocksDirectory || 'mocks'),
	tlsCertFile: flags.tlsCert,
	tlsKeyFile: flags.tlsKey,
};
console.log('**** Mimic Server ****');
await startServers(config);
