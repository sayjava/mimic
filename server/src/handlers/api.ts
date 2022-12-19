import Engine from '../engine.ts';
import { serveDir } from '../deps.ts';

const serializeRequest = async (req: Request) => {
	let body;
	const contentType = req.headers.get('content-type') ?? '';
	try {
		if (contentType.includes('form')) {
			const data = await req.formData();
			body = Object.fromEntries(data.entries());
		} else if (contentType.includes('json')) {
			body = await req.json();
		} else {
			body = await req.text();
		}
	} catch (error) {
		body = error.message;
	}

	return {
		path: new URL(req.url).pathname,
		method: req.method,
		body,
		headers: Object.fromEntries(req.headers.entries()),
	};
};

const serializeResponse = async (res: Response) => {
	let body;
	const contentType = res.headers.get('content-type') ?? '';

	if (contentType.includes('json')) {
		body = await res.json();
	} else {
		body = await res.text();
	}

	return {
		status: res.status,
		body,
		headers: Object.fromEntries(res.headers.entries()),
	};
};
export interface HandlerOptions {
	engine: Engine;
}

interface HandlerArgs {
	engine: Engine;
	request: Request;
}

const handleDashboardRequest = async (opts: HandlerArgs): Promise<any> => {
	let request = opts.request;
	const [, fileExtension = ''] = new URL(opts.request.url).pathname.split(
		'.',
	);

	if (fileExtension === '') {
		request = new Request(`${request.url}.html`, {
			headers: opts.request.headers,
			body: opts.request.body,
		});
	}

	const res = await serveDir(request, {
		fsRoot: 'dashboard',
		enableCors: true,
		quiet: true,
	});

	if (fileExtension.includes('html')) {
		res.headers.append('Content-Type', 'text/html; charset=UTF-8');
	} else if (fileExtension.includes('css')) {
		res.headers.append('Content-Type', 'text/css; charset=UTF-8');
	} else if (fileExtension.includes('js')) {
		res.headers.append(
			'Content-Type',
			'application/javascript; charset=UTF-8',
		);
	} else {
		res.headers.append('Content-Type', 'text/plain; charset=UTF-8');
	}

	return res;
};

const handleMocksRequest = async (opts: HandlerArgs): Promise<Response> => {
	const { engine, request } = opts;

	switch (opts.request.method.toLocaleLowerCase()) {
		case 'get': {
			const mocks = await engine.getMocks();
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
			await engine.addMocks(mocks);
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
				? await engine.deleteMock(id)
				: await engine.clearMocks();

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
			const result = await engine.updateMock(
				Object.assign({}, mock, { id }),
			);
			if (result) {
				return new Response('', {
					status: 201,
				});
			} else {
				return new Response(
					JSON.stringify({
						message: `${id} not deleted`,
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
			const records = await opts.engine.getRecords();
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

			return new Response(JSON.stringify(mappedRecords), {
				headers: {
					'content-type': 'application/json',
					'cache-control': 'no-cache',
				},
				status: 200,
			});
		}
		case 'delete': {
			const result = await opts.engine.clearRecords();
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

const handleRequestsRequest = async (opts: HandlerArgs): Promise<Response> => {
	await console.log('Requests', opts.request.url);
	return new Response('Requests', {
		status: 200,
	});
};

const handleResetRequest = async (opts: HandlerArgs): Promise<Response> => {
	if (opts.request.method.toLocaleLowerCase() === 'post') {
		const clearedMocks = await opts.engine.clearMocks();
		const clearedRecords = await opts.engine.clearRecords();

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
		console.info(`${url.pathname} : ${req.method}`);
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
			} else {
				response = await handleDashboardRequest(handlerOpts);
			}

			response.headers.append('Access-Control-Allow-Origin', '*');
			response.headers.append('Access-Control-Allow-Methods', '*');
			response.headers.append('Access-Control-Allow-Headers', '*');
			return response;
		} catch (error) {
			console.error(error);
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
