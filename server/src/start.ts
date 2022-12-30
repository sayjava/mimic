import { join, logger } from "./deps.ts";
import { createMemoryEngine } from "./engine.ts";
import { createHandlers } from "./handlers/index.ts";

export interface MimicConfig {
  apiPort?: number;
  serverPort?: number;
  mocksDirectory: string;
  tlsCertFile?: string;
  tlsKeyFile?: string;
  autoProxy?: boolean;
}

const defaultConfig = {
  apiPort: 8081,
  serverPort: 8080,
  mocksDirectory: Deno.realPathSync("./mocks"),
};

const loadMocks = (mocksDirectory: string): any[] => {
  try {
    const mocks: any[] = [];
    const dirMocks = Deno.realPathSync(mocksDirectory);
    Deno.statSync(dirMocks);
    for (const entry of Deno.readDirSync(mocksDirectory)) {
      if (!entry.isFile) {
        logger.warning(`${entry.name} is not a file`);
      } else {
        const filePath = join(dirMocks, entry.name);
        const mock = JSON.parse(Deno.readTextFileSync(filePath));
        const fileMocks = Array.isArray(mock) ? mock : [mock];
        mocks.push(...fileMocks);
      }
    }

    return mocks;
  } catch (error) {
    if (error.kind === Deno.errors.NotFound) {
      logger.warning(`${mocksDirectory} does not exist`);
    } else {
      logger.error(error);
    }
    return [];
  }
};

export const startServers = async (config: MimicConfig) => {
  const fullConfig = Object.assign({}, config, defaultConfig);
  const engine = await createMemoryEngine(fullConfig);
  const mocks = await loadMocks(config.mocksDirectory);
  const requestHandler = createHandlers({ engine });
  const { tlsCertFile, tlsKeyFile, serverPort } = fullConfig;
  let listener: Deno.Listener;

  await engine.addMocks(mocks);

  const handleConn = async (conn: Deno.Conn) => {
    try {
		for await (const event of Deno.serveHttp(conn)) {
     		event.respondWith(requestHandler(event.request));
    	}
	} catch (error) {
		logger.error(error)
	}
	
  };

  if (fullConfig.tlsCertFile && fullConfig.tlsKeyFile) {
  	listener = Deno.listenTls({
  		port: serverPort,
  		certFile: tlsCertFile,
  		keyFile: tlsKeyFile,
  	});
  } else {
  	listener = Deno.listen({ port: serverPort });
  }
  logger.info(`Started Server on ${serverPort}`);

  for await (const conn of listener) {
  	handleConn(conn);
  }

};
