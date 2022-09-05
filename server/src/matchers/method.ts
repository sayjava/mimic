import { MockRequest } from '../engine.ts';
import stringMatcher from './string.ts';

export default (expected: MockRequest, received: Request): boolean => {
	return stringMatcher(received.method, expected.method ?? 'GET');
};
