import { serveDir } from '../deps.ts';

export const createHandler = () => {
	return async (req: Request) => {
		const [, fileExtension = ''] = new URL(req.url).pathname.split('.');
		const baseURL = req.url.replace('/_/', '/');
		const finalURL = fileExtension === ''
			? `${baseURL}/index.html`
			: baseURL;
		const request = new Request(finalURL, {
			headers: req.headers,
			body: req.body,
		});

		const res = await serveDir(request, {
			enableCors: true,
			quiet: false,
		});
		return res;
	};
};
