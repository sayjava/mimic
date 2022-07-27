import { InMemoryStorage, Storage } from './storage.ts';

export interface EngineOptions {
	autoProxy?: boolean;
	storage: Storage;
}

export default class Engine {
	readonly options: EngineOptions;

	constructor(options: EngineOptions) {
		this.options = options;
	}

	get storage() {
		return this.options.storage;
	}
}

export const createMemoryEngine = async (opts: any): Promise<Engine> => {
	const storage = new InMemoryStorage();
	await storage.init();

	const newOptions = Object.assign({}, opts, { storage });
	return new Engine(newOptions);
};
