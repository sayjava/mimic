import { assertEquals, beforeAll, describe, it } from '../src/dev_deps.ts';
import Engine, { createMemoryEngine } from '../src/engine.ts';

describe('Path', () => {
	let engine: Engine;

	beforeAll(async () => {
		engine = await createMemoryEngine({});
		await engine.storage.addMocks([
			{
				id: 'regex-path',
				request: {
					path: '/todo/[a-z][0-9]',
					method: 'GET',
				},
				response: {
					status: 200,
					body: 'regex path',
					headers: {
						'content-type': 'text/plain',
					},
				},
			},
			{
				id: 'basic-path',
				request: {
					path: '/todos',
					method: 'GET|POST',
				},
				response: {
					status: 200,
					body: 'basic path',
					headers: {
						'content-type': 'text/plain',
					},
				},
			},
		]);
	});

	it('matches basic path', async () => {
		const req = new Request('http:/localhost:8080/todos');
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'basic path');
	});

	it('matches regex path', async () => {
		const req = new Request('http:/localhost:8080/todo/a3');
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'regex path');
	});

	it('ignores the params in the path', async () => {
		const req = new Request('http:/localhost:8080/todo/a3?done=true');
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'regex path');
	});

	it('does not match the method', async () => {
		const req = new Request('http:/localhost:8080/todo/a3', {
			method: 'POST',
		});
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'Not Found');
	});

	it('matches regex method', async () => {
		const req = new Request('http:/localhost:8080/todos', {
			method: 'POST',
		});
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'basic path');
	});
});
