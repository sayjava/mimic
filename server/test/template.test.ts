import {
	assertEquals,
	assertMatch,
	beforeAll,
	describe,
	it,
} from '../src/dev_deps.ts';
import Engine, { createTestEngine } from '../src/engine.ts';
import { registerPartials } from '../src/responses/template.ts';

describe('Query', () => {
	let engine: Engine;

	beforeAll(async () => {
		engine = await createTestEngine({});
		await registerPartials('partials');
		await engine.storage.addMocks([
			{
				id: 'data-text-template',
				request: {
					path: '/text-template',
					method: 'GET',
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
					method: 'GET',
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
					method: 'GET',
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
			{
				id: 'partials-data-json-template',
				request: {
					path: '/partials-json-template',
					method: 'GET',
				},
				response: {
					status: 200,
					headers: {
						'content-type': 'json/template',
					},
					body: `{{> items}}`,
				},
			},
			{
				id: 'randomize-template-helper',
				request: {
					path: '/randomize-template-helper',
					method: 'GET',
				},
				response: {
					status: 200,
					headers: {
						'content-type': 'text/template',
					},
					body: `Random - {{randomize "dog" "cat" "foo" "bar"}}`,
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

	it.ignore('uses partials', async () => {
		const req = new Request('http:/localhost:8080/partials-json-template');
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertMatch(
			resBody,
			/"price":"\$(\d+)"/,
		);
	});

	it('randomize template', async () => {
		const req = new Request('http:/localhost:8080/randomize-template-helper');
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertMatch(
			resBody,
			/Random - dog|cat|foo|bar/,
		);
	});
});
