import { assertEquals, beforeAll, describe, it } from '../src/dev_deps.ts';
import Engine, { createMemoryEngine } from '../src/engine.ts';

describe('Body', async () => {
	let engine: Engine;

	beforeAll(async () => {
		engine = await createMemoryEngine({});
		await engine.addMocks([
			{
				request: {
					path: '/test_path',
					body: 'A simple body counts at [0-9]+',
					method: 'POST',
					headers: {
						'content-type': 'text/plain',
					},
				},
				response: {
					status: 200,
					headers: {
						'content-type': 'text/plain',
					},
					body: 'body_simple_regex_string',
				},
			},
			{
				request: {
					path: '/test_path',
					method: 'POST',
					headers: {
						'content-type': 'application/json',
					},
					body: JSON.stringify({
						name: 'Doe',
					}),
				},
				response: {
					headers: {
						'content-type': 'text/plain',
					},
					status: 200,
					body: 'body_json_object',
				},
			},
			{
				request: {
					path: '/body_partial_json_object',
					method: 'POST',
					headers: {
						'content-type': 'application/json',
					},
					body: JSON.stringify({
						name: 'Doe',
					}),
				},
				response: {
					status: 200,
					headers: {
						'content-type': 'text/plain',
					},
					body: 'body_partial_json_object',
				},
			},
			{
				request: {
					path: '/test_path',
					method: 'POST',
					body: JSON.stringify([
						{
							name: 'user_name',
							password: 'secure_password',
						},
					]),
				},
				response: {
					status: 200,
					headers: {
						'content-type': 'application/json',
					},
					body: ['body_full_array'],
				},
			},
			{
				request: {
					path: '/body_with_array',
					method: 'POST',
					body: JSON.stringify(['mango', 'cranberry']),
				},
				response: {
					status: 200,
					headers: {
						'content-type': 'application/json',
					},
					body: ['body_partial_array'],
				},
			},
			{
				request: {
					path: '/empty_json_body',
					method: 'POST',
					headers: {
						'content-type': 'application/json',
					},
				},
				response: {
					headers: {
						'content-type': 'text/plain',
					},
					status: 200,
					body: 'empty_json_body',
				},
			},
			{
				request: {
					path: '/empty_text_body',
					method: 'POST',
					headers: {
						'content-type': 'text/plain',
					},
				},
				response: {
					headers: {
						'content-type': 'text/plain',
					},
					status: 200,
					body: 'empty_text_body',
				},
			},
		]);
	});

	it('matches regex string body', async () => {
		const req = new Request('http:/localhost:8080/test_path', {
			method: 'POST',
			body: 'A simple body counts at 9',
		});
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'body_simple_regex_string');
	});

	it('matches json array body', async () => {
		const req = new Request('http:/localhost:8080/test_path', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify([{
				name: 'user_name',
				password: 'secure_password',
			}]),
		});
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'body_full_array');
	});

	it('matches an empty json body', async () => {
		const req = new Request('http:/localhost:8080/empty_json_body', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
		});
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'empty_json_body');
	});

	it('matches an empty text body', async () => {
		const req = new Request('http:/localhost:8080/empty_text_body', {
			method: 'POST',
			headers: {
				'content-type': 'text/plain',
			},
		});
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'empty_text_body');
	});

	it('matches an array body', async () => {
		const req = new Request('http:/localhost:8080/body_with_array', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify(['mango', 'cranberry', 'apple', 'juice']),
		});
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'body_partial_array');
	});

	it('matches a partial body', async () => {
		const req = new Request(
			'http:/localhost:8080/body_partial_json_object',
			{
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify({
					name: 'Doe',
					email: 'someone@example.com',
				}),
			},
		);
		const res = await engine.executeRequest(req);
		const resBody = await res.text();
		assertEquals(resBody, 'body_partial_json_object');
	});
});
