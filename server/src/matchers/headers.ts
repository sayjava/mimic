import { MockRequest } from '../deps.ts';
import mapMatcher from './map.ts';

export default (expected: MockRequest, received: Request): boolean => {
	const receivedHeaderMap = Object.fromEntries(received.headers.entries());
	return mapMatcher(expected.headers ?? {}, receivedHeaderMap);
};
