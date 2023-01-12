import { InMemoryStorage, Storage } from "./storage.ts";
import pathMatcher from "./matchers/path.ts";
import queryMatcher from "./matchers/query.ts";
import headersMatcher from "./matchers/headers.ts";
import bodyMatcher from "./matchers/body.ts";
import methodMatcher from "./matchers/method.ts";

export interface MockRequest {
  protocol?: string;
  path: string;
  method?: string;
  body?: any;

  headers?: {
    [key: string]: string;
  };
  queryParams?: {
    [key: string]: string | number;
  };
}

export interface MockResponse {
  /**
   * HTTP Status code
   */
  status: number;

  /**
   * Response body
   */
  body?: any;

  /**
   * HTTP response headers
   */
  headers: HeadersInit;
}

export interface Forward {
  port?: string;
  protocol?: string;
  host: string;
  headers?: {
    [key: string]: string;
  };
  mockOnSuccess?: boolean;
}
export interface Mock {
  id?: string;
  name?: string;
  description?: string;
  request: MockRequest;

  response?: MockResponse;
  forward?: Forward;

  limit?: "unlimited" | number;
  priority?: number;
  delay?: number;
}
export interface ProxyRequest extends MockRequest {
  url: string;
  params?: any;
  data?: any;
}
export interface Record {
  id: string;
  request: Request;
  response: Response;
  matched?: Mock;
  timestamp: number;
}

export interface EngineOptions {
  autoProxy?: boolean;
  storage: Storage;
  fetcher?(
    input: string | Request | URL,
    init?: RequestInit | undefined
  ): Promise<Response>;
}

const FORWARD_TIMEOUT = 10000;

export default class Engine implements Storage {
  readonly options: EngineOptions;

  constructor(options: EngineOptions) {
    this.options = options;
  }

  private validateMock(mock: Mock): boolean {
    if (!mock.request) {
      throw new Error("Mock must have a request object");
    }

    if (!mock.request.path) {
      throw new Error("Mock must have a request path. See the docs");
    }

    if (!mock.request.method) {
      throw new Error("Mock must have a request method. See the docs");
    }

    if (!mock.response && !mock.forward) {
      throw new Error("Mock must have a response or a forward");
    }

    if (mock.response && !mock.response.status) {
      throw new Error("Mock response must have a status");
    }

    if (mock.forward && !mock.forward.host) {
      throw new Error("Forwarding a request most have a host");
    }

    return true;
  }

  private async isLimited(mock: Mock): Promise<boolean> {
    if (mock.limit === "unlimited" || mock.limit === undefined) {
      return false;
    }

    if (mock.limit === 0) {
      return true;
    }

    const records = await this.storage.getRecords();
    const pastRecords = records.filter((record) => {
      return record.matched?.id === mock.id;
    });

    return pastRecords.length >= (mock.limit || 0);
  }

  private forwardRequest(
    request: Request,
    forward: Forward
  ): Promise<Response> {
    try {
      const newRequest = request.clone();
      newRequest.headers.set("host", forward.host);

      const newURL = new URL(newRequest.url);
      newURL.hostname = forward.host;
      newURL.protocol = forward.protocol ?? "https";
      newURL.port = forward.port ?? "80";

      const extraHeaders = forward.headers ?? {};
      for (const key in extraHeaders) {
        newRequest.headers.append(key, extraHeaders[key]);
      }

      const fetcher = this.options.fetcher ?? fetch;
      return fetcher(new Request(newURL.toString(), newRequest));
    } catch (error) {
      return Promise.resolve(
        new Response(JSON.stringify({ message: error.toString() }, null, 2), {
          status: 500,
        })
      );
    }
  }

  deleteMock(id: string): Promise<boolean> {
    return this.storage.deleteMock(id);
  }

  updateMock(mock: Mock): Promise<boolean> {
    this.validateMock(mock);
    return this.storage.updateMock(mock);
  }

  clearRecords(): Promise<boolean> {
    return this.storage.clearRecords();
  }

  clearMocks(): Promise<boolean> {
    return this.storage.clearMocks();
  }

  type(): string {
    return this.storage.type();
  }

  init(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  getRecords(): Promise<Record[]> {
    return this.storage.getRecords();
  }

  getMocks(): Promise<Mock[]> {
    return this.storage.getMocks();
  }

  addMocks(mocks: Mock[]): Promise<boolean> {
    mocks.forEach(this.validateMock);
    return this.storage.addMocks(mocks);
  }

  addRecord(record: Record): Promise<boolean> {
    return this.storage.addRecord(record);
  }

  get storage() {
    return this.options.storage;
  }

  async match(request: Request): Promise<Mock[]> {
    const mocks = await this.storage.getMocks();
    const matches: Mock[] = [];

    for (const mock of mocks) {
      const cRequest = request.clone();
      const pathMatched = await pathMatcher(mock.request, cRequest);
      const methodMatched = await methodMatcher(mock.request, cRequest);
      const queryMatched = await queryMatcher(mock.request, cRequest);
      const headerMatched = await headersMatcher(mock.request, cRequest);
      const bodyMatched = await bodyMatcher(mock.request, cRequest);
      const isLimited = await this.isLimited(mock);

      if (
        pathMatched &&
        queryMatched &&
        headerMatched &&
        bodyMatched &&
        methodMatched &&
        !isLimited
      ) {
        matches.push(mock);
      }
    }
    return matches;
  }

  createResponseBody = (matched: Mock) => {
    const headers = (matched.response?.headers ?? {}) as any;
    const isJsonContent = (
      headers["content-type"] ||
      headers["Content-Type"] ||
      ""
    ).includes("json");

    return isJsonContent
      ? JSON.stringify(matched.response?.body || "")
      : matched.response?.body;
  };

  headersToObject = (headers: Headers) => {
    const obj: any = {};
    for (const value of headers.keys()) {
      obj[value] = headers.get(value);
    }
    return obj;
  };

  async executeRequest(request: Request): Promise<Response> {
    if (request.method.toLocaleLowerCase() === "connect") {
      return new Response();
    }

    let response = new Response("Not Found", {
      status: 404,
      headers: {
        "content-type": "text/plain",
      },
    });

    let delay = 0;

    const cloneRequest = request.clone();
    const matches = await this.match(cloneRequest);
    const [matched] = matches.sort((m1, m2) => {
      const pr1 = m1.priority || 0;
      const pr2 = m2.priority || 0;
      return pr2 - pr1;
    });

    if (matched) {
      delay = matched.delay ?? 0;

      if (matched.response) {
        response = new Response(this.createResponseBody(matched), {
          status: matched.response?.status || 200,
          headers: matched.response?.headers || {},
        });
      } else if (matched.forward) {
        let timeRef;
        response = await Promise.race<Response>([
          this.forwardRequest(request, matched.forward),
          new Promise((resolve) => {
            timeRef = setTimeout(() => {
              resolve(response);
            }, FORWARD_TIMEOUT);
          }),
        ]);
        clearTimeout(timeRef);

        if (matched.forward.mockOnSuccess) {
          const mock = {
            request: {
              path: new URL(request.url).pathname,
              method: request.method,
              body: request.body,
              headers: this.headersToObject(request.headers),
            },
            response: response.clone(),
			priority: 1
          };
          this.addMocks([mock]);
        }
      }
    }

    this.storage.addRecord({
      id: crypto.randomUUID(),
      request: request.clone(),
      response: response.clone(),
      timestamp: Date.now(),
      matched
    });

    return new Promise((resolve) => {
      setTimeout(() => resolve(response), delay);
    });
  }
}

export const createMemoryEngine = async (opts: any): Promise<Engine> => {
  const storage = new InMemoryStorage();
  await storage.init();

  const newOptions = Object.assign({}, opts, { storage });
  return new Engine(newOptions);
};
