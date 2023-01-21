import { Storage } from '../deps.ts';
import { ReadOnlyStorage } from './read-only.ts';
import { MemoryStorage } from './memory.ts';
import { MimicConfig } from '../deps.ts';

export const getStorage = (config: MimicConfig): Storage => {
	if (config.storageType === 'read-only') {
		return new ReadOnlyStorage({ directory: config.mocksDirectory });
	}

	return new MemoryStorage({ directory: config.mocksDirectory, watch: true });
};
