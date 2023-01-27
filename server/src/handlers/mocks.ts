import Engine from '../engine.ts';

export interface HandlerOptions {
	engine: Engine;
	cors?: boolean;
}

export const createHandler = (opts: HandlerOptions) => {
	return async (req: Request): Promise<Response> => {
		const response = await opts.engine.executeRequest(req);

		if (opts.cors) {
			response.headers.append('access-control-allow-origin', '*');
			response.headers.append('access-control-allow-methods', '*');
			response.headers.append('access-control-allow-headers', '*');
			response.headers.append('access-control-allow-credentials', 'true');
		}

		return response;
	};
};
