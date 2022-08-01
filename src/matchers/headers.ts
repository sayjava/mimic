import { MockRequest } from '../engine.ts';
import mapMatcher from './map.ts';

const createHeadersMap = (req: Request): { [key: string]: any } => {
	const headerMap: { [key: string]: any } = {};
	for (const [key, val] of req.headers.entries()) {
		headerMap[key] = val;
	}
	return headerMap;
};

export default (expected: MockRequest, received: Request): boolean => {
	const receivedHeaderMap = createHeadersMap(received);
	return mapMatcher(expected.headers ?? {}, receivedHeaderMap);
};
