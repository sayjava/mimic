import stringMatcher from './string.ts';

export const matchKeys = (
	expected: { [key: string]: any },
	actual: { [key: string]: any },
) => {
	const actualKeys = Object.keys(actual).map((k) => k.toLowerCase());
	const expectedKeys = Object.keys(expected).map((k) => k.toLowerCase());
	const nonMatchingKey = expectedKeys.some((key) =>
		!actualKeys.includes(key)
	);
	if (nonMatchingKey) {
		return false;
	}

	return true;
};

const mapMatcher = (
	expected: { [key: string]: any },
	actual: { [key: string]: any },
): boolean => {
	if (Object.keys(expected).length === 0) {
		return true;
	}

	try {
		if (Array.isArray(actual)) {
			if (Array.isArray(expected)) {
				const unMatched = expected.filter(
					(next, index) =>
						JSON.stringify(next) !== JSON.stringify(actual[index]),
				);
				return unMatched.length === 0;
			}
			return false;
		} else {
			// Match keys
			if (!matchKeys(expected, actual)) {
				return false;
			}

			// Match Values
			const nonMatchingValue = Object.entries(expected).some(
				([key, expValue]) => {
					if (typeof expValue === 'object') {
						return !mapMatcher(expValue, actual[key]);
					}
					return !stringMatcher(
						actual[key.toLocaleLowerCase()],
						expValue.toString(),
					);
				},
			);

			return !nonMatchingValue;
		}
	} catch (e) {
		return e;
	}
};

export default mapMatcher;
