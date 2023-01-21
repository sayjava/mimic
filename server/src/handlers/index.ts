import Engine from '../engine.ts';
import { createHandler as createMocksHandler } from './mocks.ts';
import { createHandler as createAPIHandler } from './api.ts';
import { createHandler as createDashboardHandler } from './dashboard.ts';
import { logger } from '../deps.ts';

export interface HandlerOptions {
	engine: Engine;
}

export const createHandlers = ({ engine }: { engine: Engine }) => {
	const mockHandler = createMocksHandler({ engine });
	const apiHandler = createAPIHandler({ engine });
	const dashboardHandler = createDashboardHandler();
	return (request: Request) => {
		const url = new URL(request.url);

		if (request.method.toLocaleLowerCase() === 'options') {
			return new Response('', {
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

		if (url.pathname.startsWith('/_/api')) {
			return apiHandler(request);
		}

		if (url.pathname.startsWith('/_/dashboard')) {
			return dashboardHandler(request);
		}

		logger.info(`${request.method} - ${request.url}`);
		return mockHandler(request);
	};
};
