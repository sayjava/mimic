import { MockRequest } from '../deps.ts';
import mapMatcher from './map.ts';

const createParamsMap = (url: URL): { [key: string]: any } => {
	const searchMaps: { [key: string]: any } = {};
	for (const [key, val] of url.searchParams.entries()) {
		searchMaps[key] = val;
	}
	return searchMaps;
};

export default (expected: MockRequest, received: Request): boolean => {
	const expectedMap = Object.assign(
		createParamsMap(
			new URL(`http://localhost:8080/${expected.path}`),
		),
		expected.queryParams ?? {},
	);

	const receivedMap = createParamsMap(new URL(received.url));
	return mapMatcher(expectedMap, receivedMap);
};
