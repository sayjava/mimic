import { assertEquals, beforeAll, describe, it } from '../src/dev_deps.ts';
import Engine, { createTestEngine } from '../src/engine.ts';

describe('Query', () => {
	let engine: Engine;

	beforeAll(async () => {
		engine = await createTestEngine({
			mocksDirectory: 'test',
			partialsDirectory: '',
			storageType: 'memory',
		});
		await engine.storage.addMocks([
			{
				id: 'basic-query',
				request: {
					path: '/todos',
					method: 'GET',
					queryParams: {
						id: '123',
					},
				},
				response: {
					status: 200,
					body: 'basic query',
					headers: {
						'content-type': 'text/plain',
					},
				},
			},
			{
				id: 'regex-query',
				request: {
					path: '/todos',
					method: 'GET',
					queryParams: {
						id: '[0-9]+',
						done: 'true|false',
					},
				},
				response: {
					status: 200,
					body: 'regex query',
					headers: {
						'content-type': 'text/plain',
					},
				},
			},
			{
				id: 'merged-regex-query',
				request: {
					path: '/todos?author=jane',
					method: 'GET',
					queryParams: {
						done: 'true|false',
					},
				},
				response: {
					status: 200,
					body: 'merged regex query',
					headers: {
						'content-type': 'text/plain',
					},
				},
			},
			{
				id: 'encoded url',
				request: {
					path: '/doc',
					method: 'GET',
					queryParams: {
						url: 'http://(.*).com',
					},
				},
				response: {
					status: 200,
					body: 'encoded url',
					headers: {
						'content-type': 'text/plain',
					},
				},
			},
		]);
	});

	it('matches basic query params', async () => {
		const req = new Request('http:/localhost:8080/todos?id=123');
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'basic query');
	});

	it('matches regex query params', async () => {
		const req = new Request('http:/localhost:8080/todos?id=100&done=true');
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'regex query');
	});

	it('matches merged query params and defined query params', async () => {
		const req = new Request(
			'http:/localhost:8080/todos?author=jane&done=false',
		);
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'merged regex query');
	});

	it('matches encode url query', async () => {
		const req = new Request(
			'http:/localhost:8080/doc?url=${encodeURIComponent(\'http://yarn.com\')}',
		);
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'encoded url');
	});
});
