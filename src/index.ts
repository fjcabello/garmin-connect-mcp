import { createServer } from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { GarminClient } from './client';
import {
  registerActivityTools,
  registerHealthTools,
  registerTrendTools,
  registerSleepTools,
  registerBodyTools,
  registerPerformanceTools,
  registerProfileTools,
  registerRangeTools,
  registerSnapshotTools,
  registerTrainingTools,
  registerWellnessTools,
  registerChallengeTools,
  registerWriteTools,
} from './tools';

const GARMIN_EMAIL = process.env.GARMIN_EMAIL;
const GARMIN_PASSWORD = process.env.GARMIN_PASSWORD;

if (!GARMIN_EMAIL || !GARMIN_PASSWORD) {
  console.error(
    'Error: GARMIN_EMAIL and GARMIN_PASSWORD environment variables are required.\n' +
      'Set them when adding this MCP server:\n' +
      '  claude mcp add garmin -e GARMIN_EMAIL=you@email.com -e GARMIN_PASSWORD=yourpass -- npx -y @nicolasvegam/garmin-connect-mcp',
  );
  process.exit(1);
}

// GarminClient is shared across requests; it caches auth tokens internally
const client = new GarminClient(GARMIN_EMAIL, GARMIN_PASSWORD);

function createRequestServer(): McpServer {
  const s = new McpServer({ name: 'garmin-connect-mcp', version: '1.0.0' });
  registerActivityTools(s, client);
  registerHealthTools(s, client);
  registerTrendTools(s, client);
  registerSleepTools(s, client);
  registerBodyTools(s, client);
  registerPerformanceTools(s, client);
  registerProfileTools(s, client);
  registerRangeTools(s, client);
  registerSnapshotTools(s, client);
  registerTrainingTools(s, client);
  registerWellnessTools(s, client);
  registerChallengeTools(s, client);
  // Opt-in: tools that modify or delete Garmin data are a prompt-injection target.
  if (process.env.GARMIN_ENABLE_WRITE_TOOLS === 'true') {
    registerWriteTools(s, client);
  }
  return s;
}

async function main(): Promise<void> {
  const httpPort = process.env.MCP_HTTP_PORT ? parseInt(process.env.MCP_HTTP_PORT) : undefined;

  if (httpPort) {
    const httpServer = createServer(async (req, res) => {
      if (req.url !== '/mcp') {
        res.writeHead(404).end();
        return;
      }
      // New transport + server per request (stateless mode requirement)
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      const requestServer = createRequestServer();
      await requestServer.connect(transport);
      try {
        if (req.method === 'POST') {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const body = JSON.parse(Buffer.concat(chunks).toString());
          await transport.handleRequest(req, res, body);
        } else {
          await transport.handleRequest(req, res);
        }
      } catch (err) {
        if (!res.headersSent) res.writeHead(500).end(String(err));
      }
    });

    httpServer.listen(httpPort, '127.0.0.1', () => {
      console.error(`Garmin Connect MCP server running on HTTP port ${httpPort}`);
    });
  } else {
    const transport = new StdioServerTransport();
    await createRequestServer().connect(transport);
    console.error('Garmin Connect MCP server running on stdio');
  }
}

main().catch((error) => {
  console.error('Fatal error starting server:', error);
  process.exit(1);
});
