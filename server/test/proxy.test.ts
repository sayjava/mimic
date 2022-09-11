import { assertEquals, beforeAll, describe, it } from '../src/dev_deps.ts';
import { createMemoryEngine } from '../src/engine.ts';

describe('Proxy', () => {
	const received: Request[] = [];
	let response: string;
	const fetcher = (req: Request) => {
		received.push(req);
		return Promise.resolve(new Response('ok'));
	};

	beforeAll(async () => {
		const engine = await createMemoryEngine({ autoProxy: true, fetcher });

		const req = new Request('http:/localhost:8080/please-forward', {
			headers: {
				Host: 'api.example.com',
				'x-test': 'special-header',
			},
		});

		response = await (await engine.executeRequest(req)).text();
	});

	it('returns the response from fetch', function () {
		assertEquals(response, 'ok');
	});

	it('calls the fetch proxy exactly once', () => {
		assertEquals(received.length, 1);
	});

	it('forwards the request using the host', () => {
		const [request] = received;
		assertEquals(request.url, 'http://api.example.com:8080/please-forward');
	});

	it('forwards the headers', () => {
		const [request] = received;
		assertEquals(Array.from(request.headers.entries()), [
			['host', 'api.example.com'],
			['x-test', 'special-header'],
		]);
	});

	it('throws errors if response throws', async () => {
		const engine = await createMemoryEngine({
			autoProxy: true,
			fetcher: () => {
				throw new Error('Remove Host Error');
			},
		});

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
});
