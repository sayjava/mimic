export { serve, serveTls } from 'https://deno.land/std@0.148.0/http/server.ts';
export { join as joinPath } from 'https://deno.land/std@0.154.0/path/mod.ts';
export { serveDir } from 'https://deno.land/std@0.152.0/http/file_server.ts';
export { parse } from 'https://deno.land/std@0.152.0/flags/mod.ts';
export { faker } from 'https://cdn.skypack.dev/@faker-js/faker';
export * as logger from 'https://deno.land/std@0.170.0/log/mod.ts';
export { YamlLoader } from 'https://deno.land/x/yaml_loader/mod.ts';
import Handlebars from 'https://esm.sh/handlebars@4.7.6';
export { Handlebars };

export interface MockRequest {
	protocol?: string;
	path: string;
	method?: string;
	body?: any;

	headers?: {
		[key: string]: string;
	};
	queryParams?: {
		[key: string]: string | number;
	};
}

export interface MockResponse {
	/**
	 * HTTP Status code
	 */
	status: number;

	/**
	 * Response body
	 */
	body?: any;

	/**
	 * HTTP response headers
	 */
	headers: HeadersInit;
}

export interface Forward {
	port?: string;
	protocol?: string;
	host: string;
	headers?: {
		[key: string]: string;
	};
	mockOnSuccess?: boolean;
}
export interface Mock {
	id?: string;
	name?: string;
	description?: string;
	request: MockRequest;

	response?: MockResponse;
	forward?: Forward;

	limit?: 'unlimited' | number;
	priority?: number;
	delay?: number;
}
export interface ProxyRequest extends MockRequest {
	url: string;
	params?: any;
	data?: any;
}
export interface Record {
	id: string;
	request: Request;
	response: Response;
	matched?: Mock;
	timestamp: number;
}

export interface EngineOptions {
	storage: RecordStorage;
	fetcher?(
		input: string | Request | URL,
		init?: RequestInit | undefined,
	): Promise<Response>;
}
export interface RecordStorage {
	type(): string;
	init(mocksDirectory: string): Promise<boolean>;
	getRecords(): Promise<Record[]>;
	getMocks(): Promise<Mock[]>;
	deleteMock(id: string): Promise<boolean>;
	updateMock(mock: Mock): Promise<boolean>;
	addMocks(mocks: Mock[]): Promise<boolean>;
	addRecord(record: Record): Promise<boolean>;
	clearRecords(): Promise<boolean>;
	clearMocks(): Promise<boolean>;
}

export type StorageType = 'read-only' | 'memory';

export class RecordsUpdateEvent extends Event {
	public static RecordAdded = 'records_added';
	public static RecordCleared = 'records_cleared';
	constructor(public records: Record[]) {
		super(RecordsUpdateEvent.RecordCleared);
	}
}

export class MocksUpdatedEvent extends Event {
	public static MocksUpdated = 'mocks_updated';
	constructor(public mocks: Mock[]) {
		super(MocksUpdatedEvent.MocksUpdated);
	}
}

export interface MimicConfig {
	apiPort?: number;
	port?: number;
	mocksDirectory: string;
	partialsDirectory: string;
	tlsCertFile?: string;
	tlsKeyFile?: string;
	storageType: StorageType;
	enableSSL?: boolean
}
