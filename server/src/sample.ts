const BASE_URL = Deno.env.get('BASE_URL') || 'http://localhost:8080';

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
		const url = `${BASE_URL}/todo/${i}`;
		try {
			await fetch(url, {
				method: randomMethod(),
				body: randomBody(),
				headers: {
					'content-type': 'application/json',
				},
			});
		} catch (e) {
			console.error(url, e.message);
		}
	}
};

const fillCustomer = async (max: number) => {
	for (let i = 0; i <= max; i++) {
		const url = `${BASE_URL}/customers/${i}?device=${randomDevice()}`;
		try {
			await fetch(url, {
				method: randomMethod(),
				headers: {
					'content-type': 'application/json',
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

const fixedPaths = async () => {
	for (let index = 0; index < 5; index++) {
		await Promise.all(
			['/forbidden', '/not-found', '/redirected', '/errors'].map((p) =>
				fetch(`${BASE_URL}${p}`, { method: randomMethod() })
			),
		);
	}
};

fillTodos(5);
fillCustomer(10);
fixedPaths();
// github();
