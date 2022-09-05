import { assertEquals, beforeAll, describe, it } from '../src/dev_deps.ts';
import Engine, { createMemoryEngine } from '../src/engine.ts';

describe('Limit', () => {
	let engine: Engine;

	beforeAll(async () => {
		engine = await createMemoryEngine({});
		await engine.addMocks([
			{
				id: 'limit2',
				request: {
					path: '/todos-twice',
					method: 'GET',
				},
				response: {
					status: 200,
					body: 'matched response',
				},
				limit: 2,
			},
			{
				id: 'first-limit',
				request: {
					path: '/todos$',
					method: 'GET',
				},
				response: {
					status: 200,
					body: 'first-limit',
				},
				limit: 1,
			},
			{
				id: 'second-limit',
				request: {
					path: '/todos$',
					method: 'GET',
				},
				response: {
					status: 200,
					body: 'second-limit',
				},
				limit: 1,
			},
			{
				id: 'exp1',
				request: {
					headers: {},
					path: '/tasks',
					method: 'GET',
				},
				response: {
					status: 200,
					body: 'limited-tasks',
				},
				limit: 1,
			},
			{
				id: 'exp2',
				request: {
					headers: {},
					path: '/tasks',
					method: 'GET',
				},
				response: {
					status: 500,
					body: 'unlimited-tasks',
				},
			},
		]);
	});

	it('matches 2 times exactly', async () => {
		const req = new Request('http:/localhost:8080/todos-twice');
		await engine.executeRequest(req);
		await engine.executeRequest(req);
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'Not Found');
	});

	it('matches 2 different limits', async () => {
		const req = new Request('http:/localhost:8080/todos');
		const first = await (await engine.executeRequest(req)).text();
		const second = await (await engine.executeRequest(req)).text();
		const last = await (await engine.executeRequest(req)).text();

		assertEquals(first, 'first-limit');
		assertEquals(second, 'second-limit');
		assertEquals(last, 'Not Found');
	});

	it('matches limit and unlimited', async () => {
		const req = new Request('http:/localhost:8080/tasks');
		const first = await (await engine.executeRequest(req)).text();
		const second = await (await engine.executeRequest(req)).text();
		const last = await (await engine.executeRequest(req)).text();

		assertEquals(first, 'limited-tasks');
		assertEquals(second, 'unlimited-tasks');
		assertEquals(last, 'unlimited-tasks');
	});
});
