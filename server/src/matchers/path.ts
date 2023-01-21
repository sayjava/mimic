import { MockRequest } from '../deps.ts';

export default (expected: MockRequest, received: Request): boolean => {
	const receivedPath = new URL(received.url).pathname;
	const [expectedPath] = expected.path.split('?');
	const expectedRegex = new RegExp(expectedPath);
	return !!expectedRegex.exec(receivedPath);
};
