import {
	assertEquals,
	assertObjectMatch,
	beforeAll,
	describe,
	it,
} from '../src/dev_deps.ts';
import Engine, { createMemoryEngine, Record } from '../src/engine.ts';
import { APIHandler, createHandler } from '../src/handlers/api.ts';

describe('API Test', () => {
	let engine: Engine;
	let apiHandler: APIHandler;
	let records: Record[];
	beforeAll(async () => {
		engine = await createMemoryEngine({});
		apiHandler = createHandler({ engine });
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
					headers: [['content-type', 'text/plain']],
				},
			},
			{
				id: 'to-be-deleted',
				request: {
					path: '/to-be-deleted',
					method: 'GET',
				},
				response: {
					status: 200,
				},
			},
			{
				id: 'to-be-updated',
				request: {
					path: '/to-be-updated',
					method: 'GET',
				},
				response: {
					status: 200,
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
					headers: [['content-type', 'text/plain']],
				},
			},
		]);

		await engine.executeRequest(
			new Request('http:/localhost:8080/todo/a3', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify({
					name: 'Jane Doe',
				}),
			}),
		);

		await engine.executeRequest(new Request('http:/localhost:8080/todos'));

		const req = new Request('http://localhost:8080/api/records');
		const res = await apiHandler(req);
		records = await res.json();
	});

	describe('Mocks', () => {
		it('adds a single valid mock', async () => {
			const req = new Request('http://localhost:8080/api/mocks', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify({
					request: {
						path: '/api_mock_1',
					},
					response: {
						status: 200,
					},
				}),
			});

			const res = await apiHandler(req);
			assertEquals(res.status, 201);
		});

		it('adds multiple valid mocks', async () => {
			const req = new Request('http://localhost:8080/api/mocks', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify([
					{
						request: {
							path: '/api_mock_2',
						},
						response: {
							status: 200,
						},
					},
					{
						request: {
							path: '/api_mock_3',
						},
						response: {
							status: 200,
						},
					},
				]),
			});

			const res = await apiHandler(req);
			assertEquals(res.status, 201);
		});

		it('adds multiple non-valid mocks', async () => {
			const req = new Request('http://localhost:8080/api/mocks', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify([
					{
						request: {},
						response: {
							status: 200,
						},
					},
					{
						request: {
							path: '/api_mock_3',
						},
					},
				]),
			});

			const res = await apiHandler(req);
			const body = await res.json();
			assertEquals(res.status, 500);
			assertEquals(
				body.message,
				'Error: Mock must have a request and a request path. See the docs',
			);
		});

		it('deletes an existing single mock', async () => {
			const req = new Request(
				'http://localhost:8080/api/mocks/to-be-deleted',
				{
					method: 'DELETE',
				},
			);

			const res = await apiHandler(req);
			assertEquals(res.status, 201);

			const uRes = await engine.executeRequest(
				new Request('http://localhost:8080/api/mocks/to-be-deleted'),
			);

			const updatedBody = await uRes.text();
			assertEquals(updatedBody, 'Not Found');
		});

		it('updates an existing mock', async () => {
			const req = new Request(
				'http://localhost:8080/api/mocks/to-be-updated',
				{
					method: 'PATCH',
					body: JSON.stringify({
						response: {
							status: 200,
							body: 'freshly updated',
						},
					}),
				},
			);

			const res = await apiHandler(req);
			assertEquals(res.status, 201);

			const uRes = await engine.executeRequest(
				new Request('http://localhost:8080/api/mocks/to-be-updated'),
			);

			const updatedBody = await uRes.text();
			assertEquals(updatedBody, 'freshly updated');
		});

		it('retrieves mocks', async () => {
			const res = await apiHandler(
				new Request('http://localhost:8080/api/mocks'),
			);
			const body = await res.json();
			assertEquals(res.status, 200);
			assertEquals(body.length > 0, true);
		});
	});

	describe('Records', () => {
		it('returns records', async () => {
			assertEquals(records.length, 2);
		});

		it('returns record requests', async () => {
			const request = records.at(0)?.request ?? {};
			assertObjectMatch(request, {
				body: {
					name: 'Jane Doe',
				},
				headers: {
					'content-type': 'application/json',
				},
				method: 'POST',
				path: '/todo/a3',
			});
		});

		it('returns record response', async () => {
			const response = records.at(0)?.response ?? {};
			assertObjectMatch(response, {
				body: 'Not Found',
				headers: {
					'content-type': 'text/plain',
				},
			});
		});
	});

	describe('Reset & Clear', async () => {
		it('clears all the mocks', async () => {
			const req = new Request('http://localhost:8080/api/mocks', {
				method: 'DELETE',
			});

			const res = await apiHandler(req);
			assertEquals(res.status, 201);
		});

		it('clears all the records', async () => {
			const req = new Request('http://localhost:8080/api/records', {
				method: 'DELETE',
			});

			const res = await apiHandler(req);
			assertEquals(res.status, 201);
		});

		it('clears all the records', async () => {
			const req = new Request('http://localhost:8080/api/reset', {
				method: 'POST',
			});

			const res = await apiHandler(req);
			assertEquals(res.status, 201);
		});
	});
});
