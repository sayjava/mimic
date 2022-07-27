import Engine from '../engine.ts';

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
	await console.log('Mocks Request', opts.request.url);
	return new Response('Mocks', {
		status: 200,
	});
};

const handleRecordsRequest = async (opts: HandlerArgs): Promise<Response> => {
	await console.log('Records', opts.request.url);
	return new Response('Records', {
		status: 200,
	});
};

const handleRequestsRequest = async (opts: HandlerArgs): Promise<Response> => {
	await console.log('Requests', opts.request.url);
	return new Response('Requests', {
		status: 200,
	});
};

export const createHandler = (opts: HandlerOptions) => {
	return async (req: Request): Promise<Response> => {
		const url = new URL(req.url);
		let response: Response = new Response('Not Found', {
			status: 404,
		});

		const handlerOpts = {
			request: req,
			engine: opts.engine,
		};

		switch (url.pathname) {
			case '/api/dashboard':
				response = await handleDashboardRequest(handlerOpts);
				break;

			case '/api/mocks':
				response = await handleMocksRequest(handlerOpts);
				break;

			case '/api/records':
				response = await handleRecordsRequest(handlerOpts);
				break;

			case '/api/requests':
				response = await handleRequestsRequest(handlerOpts);
				break;
		}

		return response;
	};
};
