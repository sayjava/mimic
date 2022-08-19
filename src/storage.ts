import { Mock, Record } from './engine.ts';

export interface Storage {
	type(): string;
	init(): Promise<boolean>;
	getRecords(): Promise<Record[]>;
	getMocks(): Promise<Mock[]>;
	deleteMock(id: string): Promise<boolean>;
	updateMock(mock: Mock): Promise<boolean>;
	addMocks(mocks: Mock[]): Promise<boolean>;
	addRecord(record: Record): Promise<boolean>;
	clearRecords(): Promise<boolean>;
	clearMocks(): Promise<boolean>;
}
export class InMemoryStorage implements Storage {
	private records: Record[];
	private mocks: Mock[];

	constructor() {
		this.mocks = [];
		this.records = [];
	}

	deleteMock(id: string): Promise<boolean> {
		const toBeDelete = this.mocks.find((m) => m.id === id);
		this.mocks = this.mocks.filter((m) => m.id !== id);

		if (toBeDelete) {
			return Promise.resolve(true);
		}

		return Promise.resolve(false);
	}

	updateMock(updatedMock: Mock): Promise<boolean> {
		const mockToUpdate = this.mocks.find((m) => m.id === updatedMock.id);
		if (mockToUpdate) {
			Object.assign(mockToUpdate, updatedMock);
		} else {
			this.mocks.push(updatedMock);
		}

		return Promise.resolve(true);
	}

	clearRecords(): Promise<boolean> {
		this.records = [];
		return Promise.resolve(true);
	}

	clearMocks(): Promise<boolean> {
		this.mocks = [];
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

	addMocks(mocks: Mock[]): Promise<boolean> {
		this.mocks = [...this.mocks, ...mocks];
		return Promise.resolve(true);
	}

	addRecord(record: Record): Promise<boolean> {
		this.records.push(record);
		return Promise.resolve(true);
	}

	init(): Promise<boolean> {
		return Promise.resolve(true);
	}
}
