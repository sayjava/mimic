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
	return (req: Request) => {
		const url = new URL(req.url);

		logger.info(`${req.method} - ${req.url}`);

		if (url.pathname.startsWith('/_/api')) {
			return apiHandler(req);
		}

		if (url.pathname.startsWith('/_/dashboard')) {
			return dashboardHandler(req);
		}

		return mockHandler(req);
	};
};
