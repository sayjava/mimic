import { join, logger } from './deps.ts';
import Engine, { createMemoryEngine } from './engine.ts';
import { createHandlers } from './handlers/index.ts';

export interface MimicConfig {
	apiPort?: number;
	port?: number;
	mocksDirectory: string;
	tlsCertFile?: string;
	tlsKeyFile?: string;
}

const defaultConfig = {
	port: 8080,
	mocksDirectory: 'mocks',
};

const loadMock = (filePath: string) => {
	try {
		const mock = JSON.parse(Deno.readTextFileSync(filePath));
		return Array.isArray(mock) ? mock : [mock];
	} catch (error) {
		logger.error(error);
		return [];
	}
};

const loadMocks = (mocksDirectory: string): any[] => {
	try {
		const mocks: any[] = [];
		const dirMocks = Deno.realPathSync(mocksDirectory);
		Deno.statSync(dirMocks);
		for (const entry of Deno.readDirSync(mocksDirectory)) {
			if (!entry.isFile) {
				logger.warning(`${entry.name} is not a file`);
			} else {
				try {
					const filePath = join(dirMocks, entry.name);
					mocks.push(...loadMock(filePath));
				} catch (error) {
					logger.warning(error);
				}
			}
		}

		return mocks;
	} catch (error) {
		if (error.kind === Deno.errors.NotFound) {
			logger.warning(`${mocksDirectory} does not exist`);
		} else {
			logger.warning('No mocks directory found');
		}
		return [];
	}
};

const watchMocksFolder = async (config: MimicConfig, engine: Engine) => {
	try {
		const watcher = Deno.watchFs(config.mocksDirectory);
		for await (const event of watcher) {
			logger.info(
				`Reloading mocks because ${
					event.paths.join(',')
				} ${event.kind}`,
			);
			try {
				const mocks = await loadMocks(config.mocksDirectory);
				await engine.clearMocks();
				await engine.addMocks(mocks);
			} catch (error) {
				logger.error(error);
			}
		}
	} catch (error) {
		logger.warning(error.message);
	}
};

export const startServers = async (config: MimicConfig) => {
	const fullConfig = Object.assign({}, defaultConfig, config);
	const engine = await createMemoryEngine(fullConfig);
	const mocks = await loadMocks(config.mocksDirectory);
	const requestHandler = createHandlers({ engine });
	const { tlsCertFile, tlsKeyFile, port } = fullConfig;
	let listener: Deno.Listener;

	await engine.addMocks(mocks);

	const handleConn = async (conn: Deno.Conn) => {
		try {
			for await (const event of Deno.serveHttp(conn)) {
				event.respondWith(requestHandler(event.request));
			}
		} catch (error) {
			logger.error(error);
		}
	};

	const isHTTPs = fullConfig.tlsCertFile && fullConfig.tlsKeyFile;

	if (isHTTPs) {
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
			isHTTPs ? 'https' : 'http'
		}://${Deno.hostname()}:${port}`,
	);

	watchMocksFolder(config, engine);

	for await (const conn of listener) {
		handleConn(conn);
	}
};
