import { serve } from './deps.ts';
import { createMemoryEngine } from './engine.ts';
import { createHandler as createMocksHandler } from './handlers/mocks.ts';
import { createHandler as createAPIHandler } from './handlers/api.ts';

const engine = await createMemoryEngine({});
serve(createMocksHandler({ engine }), { port: 8080 });
serve(createAPIHandler({ engine }), { port: 8081 });

console.log('Server started');
