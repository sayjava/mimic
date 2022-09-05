export default (actual: string, expected: string): boolean => {
	if (actual === expected) {
		return true;
	}

	const regex = new RegExp(expected.toLocaleLowerCase());
	return !!JSON.stringify(actual.toLocaleLowerCase()).match(regex);
};
