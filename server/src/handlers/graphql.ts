import {
	graphql,
	GraphqlRecord,
	HandlerOptions,
	logger,
	Mock,
	RecordStorage,
} from '../deps.ts';
import objectMatcher from '../matchers/map.ts';
import { jsonTemplate } from '../responses/template.ts';

interface ResolverContext {
	request: Request;
	storage: RecordStorage;
}

interface ResolveDefinition {
	[key: string]: graphql.GraphQLFieldResolver<any, ResolverContext>;
}

const introspectQuery = `
	query IntrospectionQuery {
		__schema {
			queryType { name }
			mutationType { name }
			subscriptionType { name }
			types {
				...FullType
			}
			directives {
				name
				description
				
				locations
				args {
				...InputValue
				}
			}
		}
	}

	fragment FullType on __Type {
		kind
		name
		description
		
		fields(includeDeprecated: true) {
		  name
		  description
		  args {
			...InputValue
		  }
		  type {
			...TypeRef
		  }
		  isDeprecated
		  deprecationReason
		}
		inputFields {
		  ...InputValue
		}
		interfaces {
		  ...TypeRef
		}
		enumValues(includeDeprecated: true) {
		  name
		  description
		  isDeprecated
		  deprecationReason
		}
		possibleTypes {
		  ...TypeRef
		}
	}

	fragment InputValue on __InputValue {
		name
		description
		type { ...TypeRef }
		defaultValue 
	}

	fragment TypeRef on __Type {
		kind
		name
		ofType {
		  kind
		  name
		  ofType {
			kind
			name
			ofType {
			  kind
			  name
			  ofType {
				kind
				name
				ofType {
				  kind
				  name
				  ofType {
					kind
					name
					ofType {
					  kind
					  name
					}
				  }
				}
			  }
			}
		  }
		}
	}
`;

const createSchema = async (source: string) => {
	try {
		if (source.includes('.json')) {
			const jsonSrc = await Deno.readTextFile(source);
			const { data: introspection } = JSON.parse(jsonSrc);
			return graphql.buildClientSchema(introspection);
		}
		if (source.includes('http')) {
			const res = await fetch(source, {
				method: 'POST',
				body: JSON.stringify({
					query: introspectQuery,
				}),
			});

			const { data: introspection } = await res.json();
			return graphql.buildClientSchema(introspection);
		}

		return graphql.buildSchema(Deno.readTextFileSync(source));
	} catch (error) {
		// logger.warning(error);
		return graphql.buildSchema(`
			type Query {
				hello: String
			}
		`);
	}
};

const getResponse = (mock: Mock, request: Request) => {
	const { response } = mock;
	const body = typeof response?.body === 'object'
		? JSON.stringify(response?.body)
		: response?.body;
	return jsonTemplate(request, body);
};

const parseValueNode = (
	value: graphql.ValueNode | graphql.ObjectFieldNode,
	variables: { [key: string]: any },
): any => {
	switch (value.kind) {
		case 'BooleanValue':
		case 'StringValue':
		case 'EnumValue':
			return value.value;
		case 'IntValue':
		case 'FloatValue':
			return Number(value.value);
		case 'ObjectValue': {
			const fields: { [key: string]: any } = {};
			value.fields.forEach((f) => {
				fields[f.name.value] = parseValueNode(f, variables);
			});
			return fields;
		}
		case 'Variable':
			return variables[value.name.value];
		case 'ListValue':
			return value.values.map((node) => parseValueNode(node, variables));
		case 'ObjectField':
			return parseValueNode(value.value, variables);
		default:
			// @ts-ignore
			return value.value;
	}
};

const mapArguments = (
	fieldNode: graphql.FieldNode | undefined,
	variables: { [key: string]: any },
): { [key: string]: any } => {
	if (undefined) {
		return {};
	}
	const opsArgs = fieldNode?.arguments ?? [];
	const params: { [key: string]: any } = {};
	opsArgs.forEach((opsArg) => {
		params[opsArg.name.value] = parseValueNode(opsArg.value, variables);
	});

	return params;
};

const createResolvers = (
	fields: graphql.GraphQLFieldMap<any, any> = {},
): ResolveDefinition => {
	const operations: { [key: string]: any } = {};

	for (const fieldName in fields) {
		operations[fieldName] = async (
			_: any,
			ctx: ResolverContext,
			info: graphql.GraphQLResolveInfo,
		) => {
			const { storage, request } = ctx;
			const definedMocks = await storage.getMocks();
			const graphqlMocks = definedMocks.filter((mock) =>
				mock.request.graphql
			);

			for (const mock of graphqlMocks) {
				const {
					request: { graphql = { operations: [] } },
					response: mockResponse,
					forward,
				} = mock;

				for (const operation of graphql.operations) {
					if (operation.name === info.fieldName) {
						// @ts-ignore
						const fieldNode = info.fieldNodes.find((node) =>
							node.name.value === info.fieldName
						);
						const queryParams = mapArguments(
							fieldNode,
							info.variableValues,
						);
						const paramsMatch = objectMatcher(
							operation.params ?? {},
							queryParams,
						);
						if (paramsMatch === true) {
							if (Number(mockResponse?.status) !== 200) {
								throw new Error(
									JSON.stringify(
										getResponse(mock, request),
									),
								);
							}

							if (forward) {
								// TODO: Implement forwarding of graphql requests
								logger.warning(
									'Forwarding not yet implemented',
								);
							}

							// TODO: Make operation parameters available in the body
							return getResponse(mock, request);
						}
					}
				}
			}

			return Promise.reject(
				new Error(`No mocks found for ${info.fieldName}`),
			);
		};
	}

	return operations;
};

const createGraphqlRecord = async (
	request: Request,
): Promise<GraphqlRecord> => {
	const { query, variables } = await request.json();
	const requestSchema = graphql.parse(query);

	const operations = requestSchema
		.definitions
		.filter((definition) => definition.kind === 'OperationDefinition')
		.map((definition) => {
			const opsDefinition = definition as graphql.OperationDefinitionNode;
			const selections = opsDefinition.selectionSet.selections
				.filter((selection) => selection.kind === 'Field')
				.map(
					(selection) => {
						const field = selection as graphql.FieldNode;
						return {
							name: field.name.value,
							params: mapArguments(field, variables),
						};
					},
				);
			return selections;
		})
		.flat();

	return { operations };
};

export const createHandler = async ({ engine, config }: HandlerOptions) => {
	const { storage } = engine;
	const schema = await createSchema(config.graphqlSchema || '');
	const queryOps = createResolvers(schema.getQueryType()?.getFields());
	const mutationOps = createResolvers(schema.getMutationType()?.getFields());

	return async (request: Request): Promise<Response> => {
		const { query, variables = {} } = await request.clone().json();
		const data = await graphql.graphql({
			schema,
			source: query,
			rootValue: { ...queryOps, ...mutationOps },
			contextValue: { request, storage },
			variableValues: variables,
		});

		const graphqlRecord = await createGraphqlRecord(request.clone());
		const response = new Response(JSON.stringify(data), {
			status: 200,
			headers: { 'content-type': 'application/json' },
		});

		await storage.addRecord({
			id: crypto.randomUUID(),
			request: request.clone(),
			response: response.clone(),
			graphql: graphqlRecord,
			timestamp: Date.now(),
		});

		return response;
	};
};
