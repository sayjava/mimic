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
	headers: HeadersInit;
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
	matched?: Mock;
	timestamp: number;
	proxyRequest?: ProxyRequest;
}

export interface EngineOptions {
	autoProxy?: boolean;
	storage: Storage;
	fetcher?(
		input: string | Request | URL,
		init?: RequestInit | undefined,
	): Promise<Response>;
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

	private async isLimited(mock: Mock): Promise<boolean> {
		if (mock.limit === 'unlimited' || mock.limit === undefined) {
			return false;
		}

		if (mock.limit === 0) {
			return true;
		}

		const records = await this.storage.getRecords();
		const pastRecords = records.filter((record) => {
			return record.matched?.id === mock.id;
		});

		return pastRecords.length >= (mock.limit || 0);
	}

	private proxyRequest(request: Request): Promise<Response> {
		try {
			const newRequest = request.clone();
			const newURL = new URL(newRequest.url);
			const fetcher = this.options.fetcher ?? fetch;
			newURL.hostname = newRequest.headers.get('host') ?? 'undefined';
			return fetcher(new Request(newURL.toString(), newRequest));
		} catch (error) {
			return Promise.resolve(
				new Response(
					JSON.stringify({ message: error.toString() }),
					{
						status: 500,
					},
				),
			);
		}
	}

	private serializeMock(mock: Mock): Mock {
		const headers: any = mock.response.headers || {};
		const contentType = headers['content-type'] || headers['Content-Type'];
		if (contentType?.includes('json')) {
			mock.response.body = JSON.stringify(mock.response.body);
		}
		return mock;
	}

	deleteMock(id: string): Promise<boolean> {
		return this.storage.deleteMock(id);
	}

	updateMock(mock: Mock): Promise<boolean> {
		this.validateMock(mock);
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
		return this.storage.addMocks(mocks.map(this.serializeMock));
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
			const isLimited = await this.isLimited(mock);

			if (
				pathMatched &&
				queryMatched &&
				headerMatched &&
				bodyMatched &&
				methodMatched &&
				!isLimited
			) {
				matches.push(mock);
			}
		}
		return matches;
	}

	async executeRequest(request: Request): Promise<Response> {
		const cloneRequest = request.clone();
		const matches = await this.match(cloneRequest);
		const [matched] = matches.sort((m1, m2) => {
			const pr1 = m1.priority || 0;
			const pr2 = m2.priority || 0;
			return pr2 - pr1;
		});
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
		} else if (this.options.autoProxy) {
			response = await this.proxyRequest(request);
		}

		this.storage.addRecord({
			request: request.clone(),
			response: response.clone(),
			timestamp: Date.now(),
			matched,
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
