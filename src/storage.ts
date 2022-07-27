export type Mock = {};

export type Record = {};

export interface Storage {
	type(): string;
	init(): Promise<any>;
	records(): Promise<Record>;
	getMocks(): Promise<Mock[]>;
	addMocks(mocks: Mock[]): Promise<any>;
}

export class InMemoryStorage implements Storage {
	type(): string {
		return 'InMemory';
	}
	records(): Promise<Record> {
		return Promise.resolve([]);
	}
	getMocks(): Promise<Mock[]> {
		return Promise.resolve([]);
	}
	addMocks(mocks: Mock[]): Promise<boolean> {
		return Promise.resolve(true);
	}
	init(): Promise<any> {
		return Promise.resolve(true);
	}
}
