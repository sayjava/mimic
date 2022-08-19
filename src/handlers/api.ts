import Engine from '../engine.ts';

const serializeRequest = async (req: Request) => {
	let body;
	const contentType = req.headers.get('content-type') ?? '';

	if (contentType.includes('form')) {
		const data = await req.formData();
		body = Object.fromEntries(data.entries());
	} else if (contentType.includes('json')) {
		body = await req.json();
	} else {
		body = await req.text();
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

const handleDashboardRequest = async (opts: HandlerArgs): Promise<Response> => {
	await console.log('Dashboard', opts.request.url);
	return new Response('Dashboard', {
		status: 200,
	});
};

const handleMocksRequest = async (opts: HandlerArgs): Promise<Response> => {
	const { engine, request } = opts;

	try {
		switch (opts.request.method.toLocaleLowerCase()) {
			case 'get': {
				const mocks = await engine.getMocks();
				return new Response(JSON.stringify(mocks), {
					status: 200,
					headers: {
						'content-type': 'application/json',
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
				const [id] = path.split('/').reverse();
				const result = await engine.deleteMock(id);
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
	} catch (error) {
		return new Response(
			JSON.stringify({
				message: error.message,
			}),
			{
				status: 500,
				headers: {
					'content-type': 'application/json',
				},
			},
		);
	}
};

const handleRecordsRequest = async (opts: HandlerArgs): Promise<Response> => {
	const records = [];
	for await (const record of await opts.engine.storage.getRecords()) {
		const request = await serializeRequest(record.request.clone());
		const response = await serializeResponse(record.response.clone());
		records.push(Object.assign({}, record, { request, response }));
	}

	return new Response(JSON.stringify(records), {
		headers: {
			'content-type': 'application/json',
			'cache-control': 'no-cache',
		},
		status: 200,
	});
};

const handleRequestsRequest = async (opts: HandlerArgs): Promise<Response> => {
	await console.log('Requests', opts.request.url);
	return new Response('Requests', {
		status: 200,
	});
};

export type APIHandler = (req: Request) => Promise<Response>;

export const createHandler = (opts: HandlerOptions): APIHandler => {
	return async (req: Request): Promise<Response> => {
		const url = new URL(req.url);
		let response: Response = new Response('Not Found', {
			status: 404,
		});

		const handlerOpts = {
			request: req,
			engine: opts.engine,
		};

		if (url.pathname.includes('/api/dashboard')) {
			response = await handleDashboardRequest(handlerOpts);
		}

		if (url.pathname.includes('/api/mocks')) {
			response = await handleMocksRequest(handlerOpts);
		}

		if (url.pathname.includes('/api/records')) {
			response = await handleRecordsRequest(handlerOpts);
		}

		if (url.pathname.includes('/api/requests')) {
			response = await handleRequestsRequest(handlerOpts);
		}

		return response;
	};
};
