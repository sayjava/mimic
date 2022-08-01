import Engine from '../engine.ts';

export interface HandlerOptions {
	engine: Engine;
}

export const createHandler = (opts: HandlerOptions) => {
	return (req: Request): Promise<Response> => {
		return opts.engine.executeRequest(req);
		// const text = await req.text();
		// await console.log('Received request', req.url, text);
		// return new Response(`Hello World ${req.headers.get('user-agent')}`, {
		// 	status: 200,
		// 	headers: {
		// 		'content-type': 'text/plain',
		// 	},
		// });
	};
};
