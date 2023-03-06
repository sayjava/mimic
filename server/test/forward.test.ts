import { assertEquals, beforeAll, describe, it } from '../src/dev_deps.ts';
import { createTestEngine } from '../src/engine.ts';

describe('Forward', () => {
	const received: Request[] = [];
	let response: string;

	beforeAll(async () => {
		const engine = await createTestEngine({
			mocksDirectory: 'test',
			partialsDirectory: '',
			storageType: 'memory',
		});
		// @ts-ignore
		globalThis.fetch = (req: Request) => {
			received.push(req);
			return Promise.resolve(new Response('ok'));
		};
		await engine.storage.addMocks([
			{
				request: {
					path: '.*',
					method: 'GET',
				},
				forward: {
					host: 'test.example.io',
					headers: {
						'extra-header': 'first-header',
					},
					mockOnSuccess: true,
				},
			},
		]);
		const pleaseForward = new Request(
			'http:/localhost:8080/please-forward',
			{
				headers: {
					Host: 'api.example.com',
					'x-test': 'special-header',
				},
			},
		);

		const anotherForwarded = new Request(
			'http:/localhost:8080/another-forwarded-request',
			{
				headers: {
					Host: 'api.example.com',
					'x-test': 'special-header',
				},
			},
		);

		response = await (await engine.executeRequest(pleaseForward)).text();
		response = await (await engine.executeRequest(pleaseForward)).text();
		await (await engine.executeRequest(anotherForwarded)).text();
	});

	it('returns the response from fetch', function () {
		assertEquals(response, 'ok');
	});

	it('calls the fetch proxy only once', () => {
		assertEquals(received.length, 2);
	});

	it('forwards the request using the host', () => {
		const [request] = received;
		assertEquals(request.url, 'https://test.example.io/please-forward');
	});

	it('forwards the headers', () => {
		const [request] = received;
		assertEquals(Array.from(request.headers.entries()), [
			['extra-header', 'first-header'],
			['host', 'test.example.io'],
			['x-test', 'special-header'],
		]);
	});

	it('throws errors if response throws', async () => {
		// @ts-ignore
		globalThis.fetch = (req: Request) => {
			throw new Error('Remote Host Error');
		};

		const engine = await createTestEngine({
			mocksDirectory: 'test',
			partialsDirectory: '',
			storageType: 'memory',
		});

		await engine.storage.addMocks([
			{
				request: {
					path: '.*',
					method: 'GET',
				},
				forward: {
					host: 'test.example.io',
				},
			},
		]);

		const req = new Request('http:/localhost:8080/please-forward', {
			headers: { Host: 'api.example.com' },
		});

		const res = await engine.executeRequest(req);
		const err = await res.json();

		assertEquals(err, {
			message: 'Error: Remote Host Error',
		});

		assertEquals(res.status, 500);
	});
});
