import { MimicConfig, Mock } from '../src/deps.ts';
import { assertEquals, beforeAll, describe, it } from '../src/dev_deps.ts';
import { createTestEngine } from '../src/engine.ts';
import { createHandler } from '../src/handlers/graphql.ts';

const engineConfig: MimicConfig = {
	mocksDirectory: 'test',
	partialsDirectory: '',
	storageType: 'memory',
};

const graphqlSchema = `
        type Todo {
            id: ID!
            text: String!
            completed: Boolean!
        }
        
        input CreateTodoInput {
            id: ID
            text: String!
            completed: Boolean!
        }
        
        input UpdateTodoInput {
            id: ID!
            text: String
            completed: Boolean
        }
        
        input DeleteTodoInput {
            id: ID
        }
        
        type Query {
            listTodos(total: Int = 10): [Todo]
            getTodos(ids: [String!]!): [Todo]
        }
        
        type Mutation {
            createTodo(input: CreateTodoInput!): Todo
            deleteTodo(input: DeleteTodoInput!): Todo
            updateTodo(input: UpdateTodoInput!): Todo
        }
    `;

const mocks: Mock[] = [
	{
		request: {
			path: '/graphql',
			method: 'POST',
			graphql: {
				operations: [{
					name: 'listTodos',
					params: {
						total: 20,
					},
				}],
			},
		},
		response: {
			status: 200,
			headers: {},
			body: [{
				id: 'todo-with-single-params',
				text: 'Todo with single params',
			}],
		},
	},
	{
		request: {
			path: '/graphql',
			method: 'POST',
			graphql: {
				operations: [{
					name: 'listTodos',
					params: {
						total: '[0-9]+',
					},
				}],
			},
		},
		response: {
			status: 200,
			headers: {},
			body: [{
				id: 'regex-total',
				text: 'a regex todo',
			}],
		},
	},
	{
		request: {
			path: '/graphql',
			method: 'POST',
			graphql: {
				operations: [{
					name: 'listTodos',
				}],
			},
		},
		response: {
			status: 200,
			headers: {},
			body: [{
				id: 'first-todo',
				text: 'Things to do',
			}],
		},
	},
	{
		request: {
			path: '/graphql',
			method: 'POST',
			graphql: {
				operations: [{
					name: 'getTodos',
					params: {
						ids: ['first', 'second'],
					},
				}],
			},
		},
		response: {
			status: 200,
			headers: {},
			body: [{
				id: 'list-of-params',
				text: 'List of params',
			}],
		},
	},
	{
		request: {
			path: '/graphql',
			method: 'POST',
			graphql: {
				operations: [{
					name: 'createTodo',
					params: {
						input: {
							id: 'test',
							text: 'created-todo',
						},
					},
				}],
			},
		},
		response: {
			status: 200,
			headers: {},
			body: {
				id: 'created-todo',
				text: 'A created todo',
			},
		},
	},
];

describe('Graphql', () => {
	describe.ignore('default schema', () => {
		let response: Response;
		beforeAll(async () => {
			const engine = await createTestEngine({
				mocksDirectory: 'test',
				partialsDirectory: '',
				storageType: 'memory',
			});

			const handler = await createHandler({
				engine,
				config: engineConfig,
			});

			response = await handler(
				new Request('http:/localhost:8080/graphql', {
					method: 'POST',
					body: JSON.stringify({
						query: `
             {
                hello
             }
            `,
					}),
				}),
			);
		});

		it('responds to default query', () => {
			assertEquals(response.status, 200);
		});

		it('sends default body', async () => {
			const { errors: [{ message }] } = await response.json();
			assertEquals(message, 'No mocks found for hello');
		});
	});

	describe('local schema definition', () => {
		let handler: (request: Request) => Promise<Response>;

		beforeAll(async () => {
			const engine = await createTestEngine(engineConfig);
			await engine.storage.addMocks(mocks);
			handler = await createHandler({
				engine,
				config: {
					mocksDirectory: 'test',
					partialsDirectory: '',
					storageType: 'memory',
					graphqlSchema,
				},
			});
		});

		describe('Query', () => {
			it('responds to defined operations', async () => {
				const response = await handler(
					new Request('http:/localhost:8080/graphql', {
						method: 'POST',
						body: JSON.stringify({
							query: `
                     {
                        listTodos {
                            id
                            text
                        }
                     }
                    `,
						}),
					}),
				);
				const { data, errors } = await response.json();
				assertEquals(errors, undefined);

				assertEquals(data, {
					listTodos: [{
						id: 'first-todo',
						text: 'Things to do',
					}],
				});
			});

			it('responds to defined operations with parameters', async () => {
				const response = await handler(
					new Request('http:/localhost:8080/graphql', {
						method: 'POST',
						body: JSON.stringify({
							query: `
                     {
                        listTodos(total: 20) {
                            id
                            text
                        }
                     }
                    `,
						}),
					}),
				);
				const { data, errors } = await response.json();
				assertEquals(errors, undefined);

				assertEquals(data, {
					listTodos: [{
						id: 'todo-with-single-params',
						text: 'Todo with single params',
					}],
				});
			});

			it('responds to a regex input', async () => {
				const response = await handler(
					new Request('http:/localhost:8080/graphql', {
						method: 'POST',
						body: JSON.stringify({
							query: `
                     {
                        listTodos(total: 5) {
                            id
                            text
                        }
                     }
                    `,
						}),
					}),
				);
				const { data, errors } = await response.json();
				assertEquals(errors, undefined);

				assertEquals(data, {
					listTodos: [{
						id: 'regex-total',
						text: 'a regex todo',
					}],
				});
			});

			it('responds to named operations', async () => {
				const response = await handler(
					new Request('http:/localhost:8080/graphql', {
						method: 'POST',
						body: JSON.stringify({
							query: `
                     {
                        firstTwenty: listTodos(total: 20) {
                            id
                            text
                        }
                        anotherTwenty: listTodos(total: 20) {
                            id
                            text
                        }
                     }
                    `,
						}),
					}),
				);
				const { data, errors } = await response.json();
				assertEquals(errors, undefined);

				assertEquals(data, {
					firstTwenty: [{
						id: 'todo-with-single-params',
						text: 'Todo with single params',
					}],
					anotherTwenty: [{
						id: 'todo-with-single-params',
						text: 'Todo with single params',
					}],
				});
			});

			it('responds to functions and variables', async () => {
				const response = await handler(
					new Request('http:/localhost:8080/graphql', {
						method: 'POST',
						body: JSON.stringify({
							query: `
                     query getTodo($amount: Int) {
                        firstTwenty: listTodos(total: $amount) {
                            id
                            text
                        }
                     }
                    `,
							variables: {
								amount: 2,
							},
						}),
					}),
				);
				const { data, errors } = await response.json();
				assertEquals(errors, undefined);

				assertEquals(data, {
					firstTwenty: [{
						id: 'regex-total',
						text: 'a regex todo',
					}],
				});
			});

			it('non nullable list of params', async () => {
				const response = await handler(
					new Request('http:/localhost:8080/graphql', {
						method: 'POST',
						body: JSON.stringify({
							query: `
                       {
                          getTodos(ids: ["first", "second"]) {
                              id
                              text
                          }
                       }
                      `,
						}),
					}),
				);
				const { data, errors } = await response.json();
				assertEquals(errors, undefined);
				assertEquals(data, {
					getTodos: [{
						id: 'list-of-params',
						text: 'List of params',
					}],
				});
			});
		});

		describe('Mutation', () => {
			it('create todo', async () => {
				const response = await handler(
					new Request('http:/localhost:8080/graphql', {
						method: 'POST',
						body: JSON.stringify({
							query: `
                       mutation {
                          createTodo(input: { id: "test", text: "created-todo", completed: false }) {
                              id
                              text
                          }
                       }
                      `,
						}),
					}),
				);
				const { data, errors } = await response.json();
				assertEquals(errors, undefined);
				assertEquals(data, {
					createTodo: {
						id: 'created-todo',
						text: 'A created todo',
					},
				});
			});
		});
	});
});
