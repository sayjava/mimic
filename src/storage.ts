import { Mock, Record } from './engine.ts';

export interface Storage {
	type(): string;
	init(): Promise<boolean>;
	getRecords(): Promise<Record[]>;
	getMocks(): Promise<Mock[]>;
	addMocks(mocks: Mock[]): Promise<boolean>;
	addRecord(record: Record): Promise<boolean>;
}
export class InMemoryStorage implements Storage {
	private records: Record[];
	private mocks: Mock[];

	constructor() {
		this.mocks = [];
		this.records = [];
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
