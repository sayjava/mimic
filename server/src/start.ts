import { join, logger } from "./deps.ts";
import { createMemoryEngine } from "./engine.ts";
import { createHandlers } from "./handlers/index.ts";

export interface MimicConfig {
  apiPort?: number;
  port?: number;
  mocksDirectory: string;
  tlsCertFile?: string;
  tlsKeyFile?: string;
  autoProxy?: boolean;
}

const defaultConfig = {
  port: 8080,
  mocksDirectory: "mocks",
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
      logger.warning(`No mocks directory loaded from ${mocksDirectory}`);
    }
    return [];
  }
};

export const startServers = async (config: MimicConfig) => {
  const fullConfig = Object.assign({}, defaultConfig, config);
  const engine = await createMemoryEngine(fullConfig);
  const mocks = await loadMocks(config.mocksDirectory);
  const requestHandler = createHandlers({ engine });
  const { tlsCertFile, tlsKeyFile, port } = fullConfig;
  let listener: Deno.Listener;

  await engine.addMocks(mocks);

  const handleConn = async (conn: Deno.Conn) => {
    try {
      for await (const event of Deno.serveHttp(conn)) {
        event.respondWith(requestHandler(event.request));
      }
    } catch (error) {
      logger.error(error);
    }
  };

  const isHTTPs = fullConfig.tlsCertFile && fullConfig.tlsKeyFile;

  if (isHTTPs) {
    listener = Deno.listenTls({
      port: port,
      certFile: tlsCertFile,
      keyFile: tlsKeyFile,
    });
  } else {
    listener = Deno.listen({ port: port });
  }

  logger.info(`Started Server on ${isHTTPs ? 'https': 'http'}://${Deno.hostname()}:${port}`);

  for await (const conn of listener) {
    handleConn(conn);
  }
};
