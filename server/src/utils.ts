import { Record } from './deps.ts';

export const serializeRequest = async (req: Request) => {
	let body;
	const contentType = req.headers.get('content-type') ?? '';
	try {
		if (contentType.includes('form')) {
			const data = await req.formData();
			body = Object.fromEntries(data.entries());
		} else if (contentType.includes('json')) {
			body = await req.json();
		} else {
			body = await req.text();
		}
	} catch (error) {
		body = error.message;
	}

	return {
		path: new URL(req.url).pathname,
		method: req.method,
		body,
		headers: Object.fromEntries(req.headers.entries()),
	};
};

export const serializeResponse = async (res: Response) => {
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

export const headersToObject = (headers: Headers) => {
	const obj: any = {};
	for (const value of headers.keys()) {
		obj[value] = headers.get(value);
	}
	return obj;
};

export const createRecordRequest = (request: Request): any => {
	return {
		path: new URL(request.url).pathname,
		method: request.method,
		body: request.body,
		headers: headersToObject(request.headers),
	};
};

export const isYAMLFile = (name: string): boolean => {
	return name.includes('yml') || name.includes('yaml');
};

export const isJSONFile = (name: string): boolean => {
	return name.includes('json');
};

export const serializeRecord = async (record: Record): Promise<Record> => {
	const request = await serializeRequest(record.request.clone());
	const response = await serializeResponse(
		record.response.clone(),
	);

	return Object.assign({}, record, { response, request });
};
