import { MockRequest } from '../engine.ts';

export default (expected: MockRequest, received: Request): boolean => {
	const receivedPath = new URL(received.url).pathname;
	const expectedPath =
		new URL(`http://localhost:8080${expected.path}`).pathname;
	const expectedRegex = new RegExp(expectedPath);
	return !!expectedRegex.exec(receivedPath);
};
