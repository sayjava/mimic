import { logger, MimicConfig } from './deps.ts';
import { createMemoryEngine } from './engine.ts';
import { createHandlers } from './handlers/index.ts';
import { createWsHandler } from './handlers/ws.ts';
import { registerPartials } from './responses/template.ts';

const defaultConfig = {
	port: 8080,
	mocksDirectory: 'mocks',
};

export const startServers = async (config: MimicConfig) => {
	const fullConfig = Object.assign({}, defaultConfig, config);
	const engine = await createMemoryEngine(
		fullConfig,
		fullConfig.mocksDirectory,
	);
	const requestHandler = createHandlers({ engine, cors: true });
	const wsHandler = createWsHandler({ storage: engine.storage });
	const { tlsCertFile, tlsKeyFile, port } = fullConfig;
	let listener: Deno.Listener;

	await registerPartials(fullConfig.partialsDirectory);
	const handleConn = async (conn: Deno.Conn) => {
		try {
			for await (const event of Deno.serveHttp(conn)) {
				if (event.request.headers.get('upgrade') === 'websocket') {
					event.respondWith(wsHandler(event.request));
				} else {
					event.respondWith(requestHandler(event.request));
				}
			}
		} catch (error) {
			logger.error(error);
		}
	};

	if (config.enableSSL) {
		listener = Deno.listenTls({
			port: port,
			certFile: tlsCertFile,
			keyFile: tlsKeyFile,
		});
	} else {
		listener = Deno.listen({ port: port });
	}

	logger.info(
		`Started Server on ${
			config.enableSSL ? 'https' : 'http'
		}://${Deno.hostname()}:${port}`,
	);

	for await (const conn of listener) {
		handleConn(conn);
	}
};
