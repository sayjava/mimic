import { assertEquals, beforeAll, describe, it } from '../src/dev_deps.ts';
import { createMemoryEngine } from '../src/engine.ts';

describe('Forward', () => {
	const received: Request[] = [];
	let response: string;
	const fetcher = (req: Request) => {
		received.push(req);
		return Promise.resolve(new Response('ok'));
	};

	beforeAll(async () => {
		const engine = await createMemoryEngine({ fetcher });
		await engine.addMocks([
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
		assertEquals(request.url, 'https://test.example.io:80/please-forward');
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
		const engine = await createMemoryEngine({
			fetcher: () => {
				throw new Error('Remove Host Error');
			},
		});

		await engine.addMocks([
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
			message: 'Error: Remove Host Error',
		});

		assertEquals(res.status, 500);
	});

	it('mocks response on success', async () => {});
});
