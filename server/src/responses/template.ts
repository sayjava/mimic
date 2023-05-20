import { faker, fs, Handlebars as HB, joinPath, logger } from '../deps.ts';
import { createRecordRequest } from '../utils.ts';

const Handlebars = HB.default

/**
 * Generate arrays
 *
 * example
 * [
        {{#repeat 10}}
            {
                "music": "{{data.music.songName}}",
                "price": "{{data.commerce.price}}",
				"index": "index-{{@index}}"
            }
        {{/repeat}}
    ]
 */
Handlebars.default.registerHelper('repeat', function (count: number, options: any) {
	if (Number.isNaN(count)) {
		throw new Error('Each section requires a number');
	}

	const list = [];
	for (let index = 0; index < count; index++) {
		// @ts-ignore
		list.push(options.fn(this, { data: { index } }));
	}
	return list.join(',');
});

Handlebars.registerHelper('randomize', function (...args: any) {
	const [, ...rest] = Array.from(args).reverse();
	const randomIdex = Math.floor(Math.random() * rest.length);
	return rest[randomIdex];
});

/**
 * Attempt to call faker in the background
 */
Handlebars.registerHelper('helperMissing', function (...args: any[]) {
	try {
		const [{ name }, ...params] = args.concat().reverse();
		const [, namespace, func] = name.split('.');
		// @ts-ignore
		return faker[namespace][func].call(faker, ...params);
	} catch (error) {
		return error.message;
	}
});

const registerPartial = (entry: { name: string }, basePath: string) => {
	try {
		const [partialName] = entry.name.split('.');
		Handlebars.registerPartial(
			partialName,
			Deno.readTextFileSync(joinPath(basePath, entry.name)),
		);
	} catch (error) {
		logger.error(`Error registering ${entry.name} as partial`);
	}
};

export const registerPartials = (partialsPath: string) => {
	try {
		if (!fs.existsSync(partialsPath)) {
			return false;
		}
		const entries = Deno.readDirSync(partialsPath);
		for (const entry of entries) {
			if (entry.isFile) {
				registerPartial(entry, partialsPath);
			} else {
				registerPartials(joinPath(partialsPath, entry.name));
			}
		}
	} catch (error) {
		logger.warning(error.message);
	}
};

export const watchPartials = async (partialsPath: string) => {
	try {
		if (!fs.existsSync(partialsPath)) {
			return false;
		}
		const watcher = Deno.watchFs(partialsPath);
		for await (const event of watcher) {
			logger.info(
				`Reloading partial because ${
					event.paths.join(',')
				} ${event.kind}`,
			);

			event.paths.forEach((name: string) =>
				registerPartial({ name }, partialsPath)
			);
		}
	} catch (error) {
		logger.warning(error.message);
	}
};

export const textTemplate = (req: Request, body: string): string => {
	try {
		// @ts-ignore
		return Handlebars.compile(body)({
			data: faker,
			request: createRecordRequest(req),
		});
	} catch (error) {
		return error.message;
	}
};

export const jsonTemplate = (
	req: Request,
	body: string,
): { [key: string]: any } => {
	try {
		const jsonTemplate = Handlebars.compile(body)({
			data: faker,
			request: createRecordRequest(req),
		});
		return JSON.parse(jsonTemplate);
	} catch (error) {
		return { message: error.message };
	}
};
