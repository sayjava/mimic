import { assertEquals, beforeAll, describe, it } from '../src/dev_deps.ts';
import Engine, { createTestEngine } from '../src/engine.ts';

describe('Headers', () => {
	let engine: Engine;

	beforeAll(async () => {
		engine = await createTestEngine({
			mocksDirectory: 'test',
			partialsDirectory: '',
			storageType: 'memory',
		});
		await engine.storage.addMocks([
			{
				request: {
					path: '/headers_subset_keys',
					method: 'GET',
					headers: {
						Accept: 'application/text',
						Host: 'example.com',
					},
				},
				response: {
					status: 200,
					headers: {
						'content-type': 'text/plain',
					},
					body: 'headers_subset_keys',
				},
			},
			{
				request: {
					path: '/headers_regex',
					method: 'GET',
					headers: {
						Accept: 'application/text',
						'x-mock-version': '[0-9]+',
					},
				},
				response: {
					status: 200,
					headers: {
						'content-type': 'text/plain',
					},
					body: 'headers_regex',
				},
			},
			{
				request: {
					path: '/empty_headers',
					method: 'GET',
					headers: {},
				},
				response: {
					status: 200,
					headers: {
						'content-type': 'text/plain',
					},
					body: 'empty_headers',
				},
			},
		]);
	});

	it('matches subset headers', async () => {
		const req = new Request('http:/localhost:8080/headers_subset_keys', {
			headers: {
				'Accept': 'application/text',
				'Cache-Control': 'no-cache',
				'Host': 'example.com',
			},
		});
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'headers_subset_keys');
	});

	it('matches regex headers', async () => {
		const req = new Request('http:/localhost:8080/headers_regex', {
			headers: {
				Accept: 'application/text',
				'x-mock-version': '2',
			},
		});
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'headers_regex');
	});

	it('matches empty headers', async () => {
		const req = new Request('http:/localhost:8080/empty_headers', {
			headers: {
				Accept: 'application/text',
				'x-mock-version': '2',
			},
		});
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'empty_headers');
	});

	it('miss-matches regex-headers', async () => {
		const req = new Request('http:/localhost:8080/headers_regex', {
			headers: {
				Accept: 'application/text',
				'x-mock-version': 'other-visions',
			},
		});
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'Not Found');
	});
});
