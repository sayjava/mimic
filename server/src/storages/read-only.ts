import { Mock } from '../deps.ts';
import { MemoryStorage } from './memory.ts';

export class ReadOnlyStorage extends MemoryStorage {
	constructor({ directory }: { directory: string }) {
		super({ directory, watch: false });
	}

	override clearRecords(): Promise<boolean> {
		throw new Error('This is a ready only storage');
	}

	override addMocks(_mocks: Mock[]): Promise<boolean> {
		throw new Error('This is a ready only storage');
	}

	override clearMocks(): Promise<boolean> {
		throw new Error('This is a ready only storage');
	}

	override deleteMock(_id: string): Promise<boolean> {
		throw new Error('This is a ready only storage');
	}

	override updateMock(_updatedMock: Mock): Promise<boolean> {
		throw new Error('This is a ready only storage');
	}
}
