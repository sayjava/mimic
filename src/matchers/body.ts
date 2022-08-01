import { MockRequest } from '../engine.ts';
import mapMatcher from './map.ts';
import stringMatcher from './string.ts';

export default async (
	expected: MockRequest,
	received: Request,
): Promise<boolean> => {
	if (!expected.body) {
		return true;
	}

	const contentType = received.headers.get('content-type') ?? '';

	if (contentType.includes('json')) {
		const receivedJson = await received.json();
		return mapMatcher(
			expected.body as { [key: string]: any },
			receivedJson,
		);
	}

	if (contentType.includes('plain')) {
		const receivedText = await received.text();
		return stringMatcher(String(receivedText), String(expected.body));
	}

	if (contentType.includes('form')) {
		const formData = await received.formData();
		const receivedJson: { [key: string]: any } = {};
		for (const [entry, value] of formData.entries()) {
			receivedJson[entry] = value;
		}

		return mapMatcher(
			expected.body as { [key: string]: any },
			receivedJson,
		);
	}

	return false;
};
