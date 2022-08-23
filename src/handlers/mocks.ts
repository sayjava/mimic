import Engine from '../engine.ts';

export interface HandlerOptions {
	engine: Engine;
	cors?: boolean;
}

export const createHandler = (opts: HandlerOptions) => {
	return async (req: Request): Promise<Response> => {
		const response = await opts.engine.executeRequest(req);

		if (opts.cors) {
			response.headers.append('Access-Control-Allow-Origin', '*');
			response.headers.append('Access-Control-Allow-Methods', '*');
			response.headers.append('Access-Control-Allow-Headers', '*');
		}

		return response;
	};
};
