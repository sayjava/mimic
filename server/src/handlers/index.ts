import { createHandler as createMocksHandler } from './mocks.ts';
import { createHandler as createAPIHandler } from './api.ts';
import { createHandler as createDashboardHandler } from './dashboard.ts';
import { createHandler as createGraphqlHandler } from './graphql.ts';
import { HandlerOptions, logger } from '../deps.ts';

export const createHandlers = async (opts: HandlerOptions) => {
	const mockHandler = createMocksHandler(opts);
	const apiHandler = createAPIHandler(opts);
	const dashboardHandler = createDashboardHandler();
	const graphqlHandler = await createGraphqlHandler(opts);
	const { config } = opts;
	return (request: Request) => {
		const url = new URL(request.url);

		if (request.method.toLocaleLowerCase() === 'options') {
			return new Response(null, {
				headers: {
					'access-control-allow-origin': '*',
					'access-control-allow-methods': '*',
					'access-control-allow-headers': '*',
					'access-control-allow-credentials': 'true',
				},
				status: 204,
			});
		}

		if (request.method.toLocaleLowerCase() === 'connect') {
			return new Response();
		}

		if (url.pathname.includes('status')) {
			return new Response('ok');
		}

		if (url.pathname.startsWith('/_/api')) {
			return apiHandler(request);
		}

		if (url.pathname.startsWith('/_/dashboard')) {
			return dashboardHandler(request);
		}

		if (url.pathname.startsWith('/_/config')) {
			return new Response(JSON.stringify(config), {
				status: 200,
				headers: {
					'content-type': 'application/json',
				},
			});
		}

		if (url.pathname.includes('graphql')) {
			return graphqlHandler(request);
		}

		logger.info(`${request.method} - ${request.url}`);
		return mockHandler(request);
	};
};
