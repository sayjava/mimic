const BASE_URL = 'http://localhost:8080';

await fetch(`${BASE_URL}/todo/2`);

const randomMethod = () => {
	const METHODS = ['POST', 'DELETE', 'PUT'];
	const randIndex = Math.floor(Math.random() * (METHODS.length - 1));
	return METHODS[randIndex];
};

const randomFaang = () => {
	const FAANG = ['google', 'facebook', 'twitter', 'apple'];
	const randIndex = Math.floor(Math.random() * (FAANG.length - 1));
	return FAANG[randIndex];
};

const randomDevice = () => {
	const DEVICES = ['iphone', 'motorola', 'nokia', 'pixel', 'samsung'];
	const randIndex = Math.floor(Math.random() * (DEVICES.length - 1));
	return DEVICES[randIndex];
};

const randomBody = () => {
	return JSON.stringify({
		[randomFaang()]: Math.floor(Math.random() * 100),
		[randomFaang()]: Math.floor(Math.random() * 100),
		[randomFaang()]: Math.floor(Math.random() * 100),
		[randomFaang()]: Math.floor(Math.random() * 100),
	});
};

const fillTodos = async (max: number) => {
	for (let i = 0; i <= max; i++) {
		const url = i % 2 === 0 ? `${BASE_URL}/todo/${i}` : `${BASE_URL}/todos`;
		try {
			await fetch(url, { method: randomMethod(), body: randomBody() });
		} catch (e) {
			console.error(url, e.message);
		}
	}
};

const fillCustomer = async (max: number) => {
	for (let i = 0; i <= max; i++) {
		const url = `${BASE_URL}/customer/${i}?device=${randomDevice()}`;
		try {
			await fetch(url, {
				method: randomMethod(),
				headers: {
					cookie: `Token=${Math.random() * 100};Marketing=true;`,
					'x-customer': randomFaang(),
				},
				body: randomBody(),
			});
		} catch (e) {
			console.error(url, e.message);
		}
	}
};

const github = async () => {
	const url = `${BASE_URL}/users/sayjava`;

	await fetch(url, {
		headers: { host: 'api.github.com' },
	});
};

fillTodos(5);
fillCustomer(2);
// github();
