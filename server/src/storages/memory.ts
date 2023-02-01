import {
	fs,
	joinPath,
	logger,
	Mock,
	MocksUpdatedEvent,
	Record,
	RecordStorage,
	RecordsUpdateEvent,
	YamlLoader,
} from '../deps.ts';
import { isJSONFile, isYAMLFile } from '../utils.ts';
import { EventEmitter } from 'node:events';

export class MemoryStorage implements RecordStorage {
	private records: Record[];
	private mocks: Mock[];
	private directory: string;
	private watchDirectory: boolean;
	private _emitter = new EventEmitter();

	constructor({ directory, watch }: { directory: string; watch: boolean }) {
		this.mocks = [];
		this.records = [];
		this.directory = directory;
		this.watchDirectory = watch;
	}

	public static validateMock(mock: Mock): boolean {
		if (!mock.request) {
			throw new Error('Mock must have a request object');
		}

		if (!mock.request.path) {
			throw new Error('Mock must have a request path. See the docs');
		}

		if (!mock.request.method) {
			const message =
				`Mock must have a request (${mock.request.path}) method. See the docs`;
			throw new Error(message);
		}

		if (!mock.response && !mock.forward) {
			throw new Error('Mock must have a response or a forward');
		}

		if (mock.response && !mock.response.status) {
			throw new Error('Mock response must have a status');
		}

		if (mock.forward && !mock.forward.host) {
			throw new Error('Forwarding a request most have a host');
		}

		return true;
	}

	private loadYAMLMock = async (filePath: string) => {
		try {
			const ymlLoader = new YamlLoader();
			const mock = await ymlLoader.parseFile(filePath);
			return Array.isArray(mock) ? mock : [mock];
		} catch (error) {
			logger.error(error);
			return [];
		}
	};

	private loadJSONMock = async (filePath: string) => {
		try {
			const content = await Deno.readTextFileSync(filePath);
			const mock = JSON.parse(content);
			return Array.isArray(mock) ? mock : [mock];
		} catch (error) {
			logger.error(error);
			return [];
		}
	};

	private loadMock(filePath: string): Promise<Mock[]> {
		if (!fs.existsSync(filePath)) {
			return Promise.resolve([]);
		}
		if (isYAMLFile(filePath)) {
			return this.loadYAMLMock(filePath);
		} else if (isJSONFile(filePath)) {
			return this.loadJSONMock(filePath);
		} else {
			logger.warning(`${filePath} is not supported`);
			return Promise.resolve([]);
		}
	}

	private addIdToMock(mock: Mock): Mock {
		if (mock.id) {
			return mock;
		}

		return Object.assign({}, mock, { id: crypto.randomUUID() });
	}

	private addNameToMock(mock: Mock, index: number): Mock {
		if (mock.name) {
			return mock;
		}

		return Object.assign({}, mock, { name: `Mock #${index}` });
	}

	private async loadMocks(mocksDirectory: string) {
		const mocks: any[] = [];
		try {
			if (!fs.existsSync(mocksDirectory)) {
				return Promise.resolve([]);
			}

			const dirMocks = Deno.realPathSync(mocksDirectory);
			const entries = Deno.readDirSync(mocksDirectory);

			for (const entry of entries) {
				let mockDefs = [];
				const filePath = joinPath(dirMocks, entry.name);
				if (entry.isDirectory) {
					mockDefs = await this.loadMocks(
						joinPath(dirMocks, entry.name),
					);
				} else {
					mockDefs = await this.loadMock(filePath);
					if (filePath.startsWith('_')) {
						mockDefs = mockDefs.map((mockDef) =>
							Object.assign({}, mockDef, { limit: 0 })
						);
					}
				}

				mocks.push(...mockDefs);
			}
			mocks.forEach(MemoryStorage.validateMock);
		} catch (error) {
			if (error.name === 'NotFound') {
				logger.warning(error);
			} else {
				logger.error(error);
			}
		}
		return mocks.map(this.addIdToMock).map(this.addNameToMock);
	}

	deleteMock(id: string): Promise<boolean> {
		const toBeDelete = this.mocks.find((m) => m.id === id);
		this.mocks = this.mocks.filter((m) => m.id !== id);

		dispatchEvent(new MocksUpdatedEvent(this.mocks));
		if (toBeDelete) {
			return Promise.resolve(true);
		}

		dispatchEvent(new MocksUpdatedEvent(this.mocks));
		return Promise.resolve(false);
	}

	updateMock(updatedMock: Mock): Promise<boolean> {
		const mockToUpdate = this.mocks.find((m) => m.id === updatedMock.id);
		if (mockToUpdate) {
			MemoryStorage.validateMock(
				Object.assign(mockToUpdate, updatedMock),
			);
		} else {
			MemoryStorage.validateMock(updatedMock);
			this.mocks.push(updatedMock);
		}

		this._emitter.emit(
			MocksUpdatedEvent.MocksUpdated,
			new MocksUpdatedEvent(this.mocks),
		);
		return Promise.resolve(true);
	}

	clearRecords(): Promise<boolean> {
		this.records = [];
		this._emitter.emit(
			RecordsUpdateEvent.RecordCleared,
			new RecordsUpdateEvent(this.records),
		);
		return Promise.resolve(true);
	}

	clearMocks(): Promise<boolean> {
		this.mocks = [];
		this._emitter.emit(
			MocksUpdatedEvent.MocksUpdated,
			new MocksUpdatedEvent(this.mocks),
		);
		return Promise.resolve(true);
	}

	type(): string {
		return 'InMemory';
	}

	getRecords() {
		return Promise.resolve(this.records);
	}

	getMocks(): Promise<Mock[]> {
		return Promise.resolve(this.mocks);
	}

	get emitter() {
		return this._emitter;
	}

	addMocks(mocks: Mock[]): Promise<boolean> {
		const idMocks = mocks.map(this.addIdToMock).map(this.addNameToMock);
		idMocks.forEach(MemoryStorage.validateMock);
		this.mocks = [...this.mocks, ...idMocks];

		this._emitter.emit(
			MocksUpdatedEvent.MocksUpdated,
			new MocksUpdatedEvent(this.mocks.concat().reverse()),
		);

		return Promise.resolve(true);
	}

	addRecord(record: Record): Promise<boolean> {
		this.records.push(record);
		this._emitter.emit(
			RecordsUpdateEvent.RecordAdded,
			new RecordsUpdateEvent(this.records.concat().reverse()),
		);
		return Promise.resolve(true);
	}

	private async startWatchingMocks() {
		const watcher = Deno.watchFs(this.directory);
		for await (const event of watcher) {
			logger.info(
				`Reloading mocks because ${
					event.paths.join(',')
				} ${event.kind}`,
			);

			if (
				event.kind !== 'access' && event.kind !== 'other' &&
				event.kind !== 'any'
			) {
				await this.clearMocks();
				this.mocks = await this.loadMocks(this.directory);
				this._emitter.emit(
					MocksUpdatedEvent.MocksUpdated,
					new MocksUpdatedEvent(this.mocks),
				);
			}
		}
	}

	async init(): Promise<boolean> {
		this.mocks = await this.loadMocks(this.directory);
		this._emitter.emit(
			MocksUpdatedEvent.MocksUpdated,
			new MocksUpdatedEvent(this.mocks),
		);
		if (this.watchDirectory && fs.existsSync(this.directory)) {
			this.startWatchingMocks();
		}
		return Promise.resolve(true);
	}
}
