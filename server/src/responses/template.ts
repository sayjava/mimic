import { faker, Handlebars } from '../deps.ts';
import { createRecordRequest } from '../utils.ts';

/**
 * Generate arrays
 *
 * example
 * [
        {{#repeat 10}}
            {
                "music": "{{data.music.songName}}",
                "price":: {{data.commerce.price}}
            }
        {{/repeat}}
    ]
 */
Handlebars.registerHelper('repeat', function (count: number, options: any) {
	if (Number.isNaN(count)) {
		throw new Error('Each section requires a number');
	}

	const list = [];
	for (let index = 0; index < count; index++) {
		// @ts-ignore
		list.push(options.fn(this));
	}
	return list.join(',');
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
