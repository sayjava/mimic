import { join, serve, serveTls } from './deps.ts';
import { createMemoryEngine } from './engine.ts';
import { createHandlers } from './handlers/index.ts';

export interface MimicConfig {
	apiPort?: number;
	serverPort?: number;
	mocksDirectory: string;
	tlsCertFile?: string;
	tlsKeyFile?: string;
	autoProxy?: boolean;
}

const defaultConfig = {
	apiPort: 8081,
	serverPort: 8080,
	mocksDirectory: Deno.realPathSync('./mocks'),
};

const loadMocks = (mocksDirectory: string): any[] => {
	try {
		const mocks: any[] = [];
		const dirMocks = Deno.realPathSync(mocksDirectory);
		Deno.statSync(dirMocks);
		for (const entry of Deno.readDirSync(mocksDirectory)) {
			if (!entry.isFile) {
				console.warn(`${entry.name} is not a file`);
			} else {
				const filePath = join(dirMocks, entry.name);
				const mock = JSON.parse(Deno.readTextFileSync(filePath));
				const fileMocks = Array.isArray(mock) ? mock : [mock];
				mocks.push(...fileMocks);
			}
		}

		return mocks;
	} catch (error) {
		if (error.kind === Deno.errors.NotFound) {
			console.warn(`${mocksDirectory} does not exist`);
		} else {
			console.error(error);
		}
		return [];
	}
};

export const startServers = async (config: MimicConfig) => {
	const fullConfig = Object.assign({}, config, defaultConfig);
	const engine = await createMemoryEngine(fullConfig);
	const mocks = await loadMocks(config.mocksDirectory);

	await engine.addMocks(mocks);

	if (fullConfig.tlsCertFile && fullConfig.tlsKeyFile) {
		serveTls(createHandlers({ engine }), {
			certFile: fullConfig.tlsCertFile,
			keyFile: fullConfig.tlsKeyFile,
			port: fullConfig.serverPort,
		});
	} else {
		serve(createHandlers({ engine }), { port: fullConfig.serverPort });
	}

};
