import {
	assertEquals,
	assertMatch,
	beforeAll,
	describe,
	it,
} from '../src/dev_deps.ts';
import Engine, { createMemoryEngine } from '../src/engine.ts';

describe('Query', () => {
	let engine: Engine;

	beforeAll(async () => {
		engine = await createMemoryEngine({});
		await engine.storage.addMocks([
			{
				id: 'data-text-template',
				request: {
					path: '/text-template',
				},
				response: {
					status: 200,
					headers: {
						'content-type': 'text/template',
					},
					body:
						`My first name is {{data.name.firstName}} and email is {{data.internet.email}} from {{request.path}}`,
				},
			},
			{
				id: 'data-text-header-template',
				request: {
					path: '/text-header-template',
				},
				response: {
					status: 200,
					headers: {
						'content-type': 'text/template',
					},
					body: 'Say hello {{request.headers.name}}',
				},
			},
			{
				id: 'data-json-template',
				request: {
					path: '/json-template',
				},
				response: {
					status: 200,
					headers: {
						'content-type': 'json/template',
					},
					body: `[
            {{#repeat 10}}
                "{{data.vehicle.manufacturer}}"
            {{/repeat}}
          ]`,
				},
			},
		]);
	});

	it('creates a text template', async () => {
		const req = new Request('http:/localhost:8080/text-template');
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertMatch(
			resBody,
			/My first name is (.*) and email is (.*)@(.*) from \/text-template/,
		);
	});

	it('creates a text template', async () => {
		const req = new Request('http:/localhost:8080/text-header-template', {
			headers: { name: 'Jane Doe' },
		});
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertMatch(
			resBody,
			/Say hello Jane Doe/,
		);
	});

	it('creates a json template', async () => {
		const req = new Request('http:/localhost:8080/json-template');
		const res = await engine.executeRequest(req);
		const resBody = await res.json();
		assertEquals(
			resBody.length,
			10,
		);
	});
});
