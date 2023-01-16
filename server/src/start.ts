import { join, logger, YamlLoader } from './deps.ts';
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

const loadYAMLMock = async (filePath: string) => {
	try {
		const ymlLoader = new YamlLoader();
		const mock = await ymlLoader.parseFile(filePath);
		return Array.isArray(mock) ? mock : [mock];
	} catch (error) {
		logger.error(error);
		return [];
	}
};

const loadJSONMock = async (filePath: string) => {
	try {
		const content = await Deno.readTextFileSync(filePath);
		const mock = JSON.parse(content);
		return Array.isArray(mock) ? mock : [mock];
	} catch (error) {
		logger.error(error);
		return [];
	}
};

const isYAMLFile = (name: string): boolean => {
	return name.includes('yml') || name.includes('yaml');
};

const isJSONFile = (name: string): boolean => {
	return name.includes('json');
};

const loadMocks = async (mocksDirectory: string): any[] => {
	try {
		const mocks: any[] = [];
		const dirMocks = Deno.realPathSync(mocksDirectory);

		// check if directory exists
		const entries = Deno.readDirSync(mocksDirectory);

		for (const entry of entries) {
			const filePath = join(dirMocks, entry.name);
			if (entry.isDirectory) {
				const mockDefs = await loadMocks(join(dirMocks, entry.name));
				mocks.push(...mockDefs);
			} else if (isYAMLFile(filePath)) {
				const mockDefinitions = await loadYAMLMock(filePath);
				mocks.push(...mockDefinitions);
			} else if (isJSONFile(filePath)) {
				const mockDefinitions = await loadJSONMock(filePath);
				mocks.push(...mockDefinitions);
			} else {
				logger.warning(`${entry.name} is not supported`);
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
