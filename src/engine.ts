import { InMemoryStorage, Storage } from './storage.ts';
import pathMatcher from './matchers/path.ts';
import queryMatcher from './matchers/query.ts';
import headersMatcher from './matchers/headers.ts';
import bodyMatcher from './matchers/body.ts';
import methodMatcher from './matchers/method.ts';

export interface MockRequest {
	protocol?: string;
	path: string;
	method?: string;
	body?: any;

	headers?: {
		[key: string]: string;
	};
	pathParams?: {
		[key: string]: string | number;
	};
	queryParams?: {
		[key: string]: string | number;
	};
	time?: number;
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
	headers?: HeadersInit;
}

export interface Proxy {
	port?: number;
	protocol?: string;
	host: string;
	followRedirect?: boolean;
	skipVerifyTLS?: boolean;
	keepHost?: boolean;
	headers?: {
		[key: string]: string | number;
	};
}
export interface Mock {
	id?: string;
	name?: string;
	description?: string;
	request: MockRequest;
	response: MockResponse;

	/**
	 * Proxy for this mock
	 */
	proxy?: Proxy;

	/** */
	limit?: 'unlimited' | number;

	/**
	 * Time to live for this mock
	 */
	timeToLive?: number;

	/**
	 * Priority
	 */
	priority?: number;

	/**
	 * Delay to respond
	 */
	delay?: number;
}
export interface ProxyRequest extends MockRequest {
	url: string;
	params?: any;
	data?: any;
}
export interface Record {
	request: Request;
	response: Response;
	matches: Mock[];
	timestamp: number;
	proxyRequest?: ProxyRequest;
}

export interface EngineOptions {
	autoProxy?: boolean;
	storage: Storage;
}

export default class Engine implements Storage {
	readonly options: EngineOptions;

	constructor(options: EngineOptions) {
		this.options = options;
	}

	private validateMock(mock: Mock): boolean {
		if (!mock.request || !mock.request.path) {
			throw new Error(
				'Mock must have a request and a request path. See the docs',
			);
		}

		if (!mock.response) {
			throw new Error('Mock must have a response');
		}

		return true;
	}

	deleteMock(id: string): Promise<boolean> {
		return this.storage.deleteMock(id);
	}

	updateMock(mock: Mock): Promise<boolean> {
		return this.storage.updateMock(mock);
	}

	clearRecords(): Promise<boolean> {
		return this.storage.clearRecords();
	}

	clearMocks(): Promise<boolean> {
		return this.storage.clearMocks();
	}

	type(): string {
		return this.storage.type();
	}

	init(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	getRecords(): Promise<Record[]> {
		return this.storage.getRecords();
	}

	getMocks(): Promise<Mock[]> {
		return this.storage.getMocks();
	}

	addMocks(mocks: Mock[]): Promise<boolean> {
		mocks.forEach(this.validateMock);
		return this.storage.addMocks(mocks);
	}

	addRecord(record: Record): Promise<boolean> {
		return this.storage.addRecord(record);
	}

	get storage() {
		return this.options.storage;
	}

	async match(request: Request): Promise<Mock[]> {
		const mocks = await this.storage.getMocks();
		const matches: Mock[] = [];

		for (const mock of mocks) {
			const cRequest = request.clone();
			const pathMatched = await pathMatcher(mock.request, cRequest);
			const methodMatched = await methodMatcher(mock.request, cRequest);
			const queryMatched = await queryMatcher(mock.request, cRequest);
			const headerMatched = await headersMatcher(mock.request, cRequest);
			const bodyMatched = await bodyMatcher(mock.request, cRequest);

			if (
				pathMatched &&
				queryMatched &&
				headerMatched &&
				bodyMatched &&
				methodMatched
			) {
				matches.push(mock);
			}
		}
		return matches;
	}

	async executeRequest(request: Request): Promise<Response> {
		const cloneRequest = request.clone();
		const matches = await this.match(cloneRequest);
		const [matched] = matches;
		let response = new Response('Not Found', {
			status: 404,
			headers: {
				'content-type': 'text/plain',
			},
		});
		if (matched) {
			response = new Response(matched.response.body, {
				status: matched.response.status || 200,
				headers: matched.response.headers || {},
			});
		}

		this.storage.addRecord({
			request,
			response,
			timestamp: Date.now(),
			matches,
		});

		return response;
	}
}

export const createMemoryEngine = async (opts: any): Promise<Engine> => {
	const storage = new InMemoryStorage();
	await storage.init();

	const newOptions = Object.assign({}, opts, { storage });
	return new Engine(newOptions);
};
