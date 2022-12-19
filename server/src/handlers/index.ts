import Engine from "../engine.ts";
import { createHandler as createMocksHandler } from "./mocks.ts";
import { createHandler as createAPIHandler } from "./api.ts";

export interface HandlerOptions {
  engine: Engine;
}

export const createHandlers = ({ engine }: { engine: Engine }) => {
  const mockHandler = createMocksHandler({ engine });
  const apiHandler = createAPIHandler({ engine });

  
  return (req: Request) => {
      const url = new URL(req.url)      

    if (url.pathname.startsWith("/_/api")) {
      console.log("REQUEST", req.url);
      return apiHandler(req);
    }

    return mockHandler(req)
  }
};
