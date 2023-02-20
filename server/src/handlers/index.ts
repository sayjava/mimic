import Engine from '../engine.ts';
import { createHandler as createMocksHandler } from './mocks.ts';
import { createHandler as createAPIHandler } from './api.ts';
import { createHandler as createDashboardHandler } from './dashboard.ts';
import { logger, MimicConfig } from '../deps.ts';

export interface HandlerOptions {
	engine: Engine;
	cors?: boolean;
	config: MimicConfig;
}

export const createHandlers = (opts: HandlerOptions) => {
	const mockHandler = createMocksHandler(opts);
	const apiHandler = createAPIHandler(opts);
	const dashboardHandler = createDashboardHandler();
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
			return new Response(JSON.stringify(opts.config), {
				status: 200,
				headers: {
					'content-type': 'application/json',
				},
			});
		}

		logger.info(`${request.method} - ${request.url}`);
		return mockHandler(request);
	};
};
