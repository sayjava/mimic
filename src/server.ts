import { serve } from './deps.ts';
import { createMemoryEngine } from './engine.ts';
import { createHandler as createMocksHandler } from './handlers/mocks.ts';
import { createHandler as createAPIHandler } from './handlers/api.ts';

const engine = await createMemoryEngine({});
engine.storage.addMocks([
	{
		id: 'test-mock',
		request: {
			path: '/todos',
			method: 'GET',
		},
		response: {
			status: 200,
			body: JSON.stringify([
				{
					name: 'todo1',
					text: 'sample todo',
				},
			]),
			headers: [['content-type', 'application/json']],
		},
	},
]);

serve(createMocksHandler({ engine }), { port: 8080 });
serve(createAPIHandler({ engine }), { port: 8081 });

console.log('Server started');
