import { assertEquals, beforeAll, describe, it } from '../src/dev_deps.ts';
import Engine, { createMemoryEngine } from '../src/engine.ts';

describe('Priority', () => {
	let engine: Engine;

	beforeAll(async () => {
		engine = await createMemoryEngine({});
		await engine.addMocks([
			{
				id: 'exp1',
				name: 'sample1',
				request: {
					path: '/todos',
					method: 'GET|POST',
				},
				response: {
					headers: {
						'content-type': 'text/plain',
					},
					status: 200,
					body: 'No Priority set, defaults to zero',
				},
				limit: 2,
			},
			{
				id: 'exp2',
				name: 'sample2',
				request: {
					path: '/todos',
					method: 'GET|POST',
				},
				response: {
					headers: {
						'content-type': 'text/plain',
					},
					status: 200,
					body: 'Mock priority -1',
				},
				limit: 2,
				priority: -1,
			},
			{
				id: 'exp3',
				name: 'sample2',
				request: {
					path: '/todos',
					method: 'GET|POST',
				},
				response: {
					headers: {
						'content-type': 'text/plain',
					},
					status: 200,
					body: 'Mock priority 0',
				},
				limit: 2,
				priority: 0,
			},
			{
				id: 'exp4',
				name: 'sample2',
				request: {
					path: '/todos',
					method: 'GET',
				},
				response: {
					headers: {
						'content-type': 'text/plain',
					},
					status: 200,
					body: 'Mock priority 1',
				},
				limit: 2,
				priority: 1,
			},
		]);
	});

	it('matches a request highest priority exactly twice', async () => {
		const req = new Request('http:/localhost:8080/todos');
		await engine.executeRequest(req);
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'Mock priority 1');
	});

	it('matches a request with no priority but limited to 2', async () => {
		const req = new Request('http:/localhost:8080/todos');
		await engine.executeRequest(req);
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'No Priority set, defaults to zero');
	});

	it('matches a request with priority zero', async () => {
		const req = new Request('http:/localhost:8080/todos');
		await engine.executeRequest(req);
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'Mock priority 0');
	});

	it('matches request to last priority of -1', async () => {
		const req = new Request('http:/localhost:8080/todos');
		await engine.executeRequest(req);
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'Mock priority -1');
	});
});
