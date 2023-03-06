import pathMatcher from './matchers/path.ts';
import queryMatcher from './matchers/query.ts';
import headersMatcher from './matchers/headers.ts';
import bodyMatcher from './matchers/body.ts';
import methodMatcher from './matchers/method.ts';
import { jsonTemplate, textTemplate } from './responses/template.ts';
import {
	createRecordRequest,
	headersToObject,
	serializeResponse,
} from './utils.ts';
import { MemoryStorage } from './storages/memory.ts';
import { Forward, MimicConfig, Mock, Record, RecordStorage } from './deps.ts';

export interface EngineOptions {
	storage: RecordStorage;
}

const FORWARD_TIMEOUT = 10000;

export default class Engine {
	readonly options: EngineOptions;

	constructor(options: EngineOptions) {
		this.options = options;
	}

	private async isLimited(mock: Mock): Promise<boolean> {
		if (mock.limit === 'unlimited' || mock.limit === undefined) {
			return false;
		}

		if (mock.limit === 0) {
			return true;
		}

		const records = await this.storage.getRecords();
		const pastRecords = records.filter((record: Record) => {
			return record.matched?.id === mock.id;
		});

		return pastRecords.length >= (mock.limit || 0);
	}

	private forwardRequest(
		request: Request,
		forward: Forward,
	): Promise<Response> {
		try {
			const url = new URL(request.url);
			url.host = forward.host;

			const newURL = new URL(request.url);
			newURL.hostname = forward.host;
			newURL.protocol = forward.protocol ?? 'https';
			newURL.port = forward.port ?? '443';

			const headers = Object.assign(
				{},
				headersToObject(request.headers),
				forward.headers ?? {},
				{ host: forward.host },
			);

			const newRequest = new Request(newURL, {
				body: request.clone().body,
				headers,
			});

			return fetch(newRequest);
		} catch (error) {
			return Promise.resolve(
				new Response(
					JSON.stringify({ message: error.toString() }, null, 2),
					{
						status: 500,
					},
				),
			);
		}
	}

	type(): string {
		return this.storage.type();
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

	createResponseBody = (
		req: Request,
		matched: Mock,
	): { body: string; type: string } => {
		const headers = (matched.response?.headers ?? {}) as any;
		const contentType = headers['content-type'] ??
			headers['Content-Type'] ?? '';

		if (contentType === 'text/template') {
			return {
				body: textTemplate(req, matched.response?.body),
				type: 'text/plain',
			};
		}

		if (contentType === 'html/template') {
			return {
				body: textTemplate(req, matched.response?.body),
				type: 'text/html; charset=utf-8',
			};
		}

		if (contentType === 'json/template') {
			return {
				body: JSON.stringify(jsonTemplate(req, matched.response?.body)),
				type: 'application/json',
			};
		}

		if (contentType.includes('json')) {
			return {
				body: JSON.stringify(matched.response?.body || ''),
				type: 'application/json',
			};
		}

		return { body: matched.response?.body, type: contentType };
	};

	async executeRequest(request: Request): Promise<Response> {
		let response = new Response('Not Found', {
			status: 404,
			headers: {
				'content-type': 'text/plain',
			},
		});

		let delay = 0;

		const cloneRequest = request.clone();
		const matches = await this.match(cloneRequest);
		const [matched] = matches.sort((m1, m2) => {
			const pr1 = m1.priority || 0;
			const pr2 = m2.priority || 0;
			return pr2 - pr1;
		});

		if (matched) {
			delay = matched.delay ?? 0;

			if (matched.response) {
				const { body, type: contentType } = this.createResponseBody(
					request,
					matched,
				);
				response = new Response(body, {
					status: matched.response?.status || 200,
					headers: Object.assign(
						{},
						matched.response?.headers || {},
						{
							'content-type': contentType,
						},
					),
				});
			} else if (matched.forward) {
				let timeRef;
				response = await Promise.race<Response>([
					this.forwardRequest(request, matched.forward),
					new Promise((resolve) => {
						timeRef = setTimeout(() => {
							resolve(response);
						}, FORWARD_TIMEOUT);
					}),
				]);
				clearTimeout(timeRef);

				if (matched.forward.mockOnSuccess) {
					const mock = {
						request: createRecordRequest(request),
						response: await serializeResponse(response.clone()),
						priority: 1,
					};
					await this.storage.addMocks([mock]);
				}
			}
		}

		await this.storage.addRecord({
			id: crypto.randomUUID(),
			request: request.clone(),
			response: response.clone(),
			timestamp: Date.now(),
			matched,
		});

		return new Promise((resolve) => {
			setTimeout(() => resolve(response), delay);
		});
	}
}

export const createMemoryEngine = async (
	config: MimicConfig,
): Promise<Engine> => {
	const { mocksDirectory: directory } = config;
	const storage = new MemoryStorage({ directory, watch: true });
	await storage.init();

	const newOptions = Object.assign({}, config, { storage });
	return new Engine(newOptions);
};

export const createTestEngine = async (
	config: MimicConfig,
): Promise<Engine> => {
	const storage = new MemoryStorage({ directory: 'nothing', watch: false });
	await storage.init();

	const newOptions = Object.assign({}, config, { storage });
	return new Engine(newOptions);
};
