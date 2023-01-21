import { logger } from '../deps.ts';
import Engine from '../engine.ts';
import { serializeRequest, serializeResponse } from '../utils.ts';
export interface HandlerOptions {
	engine: Engine;
}
interface HandlerArgs {
	engine: Engine;
	request: Request;
}

const handleMocksRequest = async (opts: HandlerArgs): Promise<Response> => {
	const { engine, request } = opts;

	switch (opts.request.method.toLocaleLowerCase()) {
		case 'get': {
			const mocks = await engine.storage.getMocks();
			return new Response(JSON.stringify(mocks), {
				status: 200,
				headers: {
					'content-type': 'application/json',
					'cache-control': 'no-cache',
				},
			});
		}

		case 'post': {
			const body = await request.json();
			const mocks = Array.isArray(body) ? body : [body];
			await engine.storage.addMocks(mocks);
			return new Response(undefined, {
				status: 201,
				headers: {
					'content-type': 'application/json',
				},
			});
		}

		case 'delete': {
			const path = new URL(request.url).pathname;
			const [, id] = path.split('/api/mocks/');
			const result = id
				? await engine.storage.deleteMock(id)
				: await engine.storage.clearMocks();

			if (result) {
				return new Response('', { status: 201 });
			} else {
				return new Response(
					JSON.stringify({
						message: id ? `${id} not deleted` : 'mocks not deleted',
					}),
					{
						status: 406,
					},
				);
			}
		}

		case 'patch': {
			const path = new URL(request.url).pathname;
			const [id] = path.split('/').reverse();
			const mock = await request.json();
			const result = await engine.storage.updateMock(
				Object.assign({}, mock, { id }),
			);
			if (result) {
				return new Response('', {
					status: 201,
				});
			} else {
				return new Response(
					JSON.stringify({
						message: `${id} not updated`,
					}),
					{
						status: 406,
					},
				);
			}
		}
	}
	return new Response('Not Found', {
		status: 404,
	});
};

const handleRecordsRequest = async (opts: HandlerArgs): Promise<Response> => {
	switch (opts.request.method.toLocaleLowerCase()) {
		case 'get': {
			const records = await opts.engine.storage.getRecords();
			const mappedRecords = [];

			for (const record of records) {
				const request = await serializeRequest(record.request.clone());
				const response = await serializeResponse(
					record.response.clone(),
				);
				mappedRecords.push(
					Object.assign({}, record, { response, request }),
				);
			}

			return new Response(JSON.stringify(mappedRecords.reverse()), {
				headers: {
					'content-type': 'application/json',
					'cache-control': 'no-cache',
				},
				status: 200,
			});
		}
		case 'delete': {
			const result = await opts.engine.storage.clearRecords();
			if (result) {
				return new Response('', {
					status: 201,
				});
			}

			return new Response(
				JSON.stringify({ message: 'could not clear records' }),
				{
					status: 406,
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);
		}
		default:
			return new Response('Not Found', {
				status: 404,
				headers: {
					'Content-Type': 'text/plain',
				},
			});
	}
};

const handleRequestsRequest = (opts: HandlerArgs): Promise<Response> => {
	return Promise.resolve(
		new Response('Requests', {
			status: 200,
		}),
	);
};

const handleResetRequest = async (opts: HandlerArgs): Promise<Response> => {
	if (opts.request.method.toLocaleLowerCase() === 'post') {
		const clearedMocks = await opts.engine.storage.clearMocks();
		const clearedRecords = await opts.engine.storage.clearRecords();

		if (clearedMocks && clearedRecords) {
			return new Response('', {
				status: 201,
			});
		}

		return new Response('Could not clear records and requests', {
			status: 406,
		});
	}

	return new Response('Not Found', {
		status: 404,
		headers: {
			'Content-Type': 'text/plain',
		},
	});
};

export type APIHandler = (req: Request) => Promise<Response>;

export const createHandler = (opts: HandlerOptions): APIHandler => {
	return async (req: Request): Promise<Response> => {
		const url = new URL(req.url);
		try {
			let response: Response = new Response('Not Found', {
				status: 404,
			});

			const handlerOpts = {
				request: req,
				engine: opts.engine,
			};

			if (req.method === 'OPTIONS') {
				response = new Response('', { status: 200 });
			} else if (url.pathname.includes('mocks')) {
				response = await handleMocksRequest(handlerOpts);
			} else if (url.pathname.includes('records')) {
				response = await handleRecordsRequest(handlerOpts);
			} else if (url.pathname.includes('requests')) {
				response = await handleRequestsRequest(handlerOpts);
			} else if (url.pathname.includes('reset')) {
				response = await handleResetRequest(handlerOpts);
			}

			response.headers.append('Access-Control-Allow-Origin', '*');
			response.headers.append('Access-Control-Allow-Methods', '*');
			response.headers.append('Access-Control-Allow-Headers', '*');
			return response;
		} catch (error) {
			logger.error(error);
			return new Response(JSON.stringify({ message: error.toString() }), {
				status: 500,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': '*',
					'Access-Control-Allow-Headers': '*',
					'Content-Type': 'application/json',
				},
			});
		}
	};
};
