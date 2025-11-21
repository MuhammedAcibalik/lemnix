import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./server/createApp.js";
import { env } from "./config/env.js";
import { databaseManager } from "./config/database.js";
import { logger } from "./services/logger.js";
import { startQueryMonitoring } from "./middleware/queryMonitoring.js";

async function bootstrap(): Promise<void> {
  const httpServer = createServer();
  const io = createSocketServer(httpServer);
  const app = createApp({ io });

  httpServer.on("request", app);

  httpServer.listen(env.PORT, async () => {
    try {
      await databaseManager.connect();
      await databaseManager.initialize();
      startQueryMonitoring();

      logger.info("LEMNİX Backend API running", {
        url: `http://localhost:${env.PORT}`,
        environment: env.NODE_ENV,
        frontendUrl: env.FRONTEND_URL,
      });
    } catch (error) {
      logger.error("Failed to start server", error as Error);
      process.exit(1);
    }
  });

  httpServer.on("error", (error: NodeJS.ErrnoException) => {
    if (error.syscall !== "listen") {
      throw error;
    }

    switch (error.code) {
      case "EACCES":
        logger.error("Port requires elevated privileges", error, {
          port: env.PORT,
        });
        process.exit(1);
        break; // Unreachable but satisfies linter
      case "EADDRINUSE":
        logger.error("Port is already in use", error, { port: env.PORT });
        process.exit(1);
        break; // Unreachable but satisfies linter
      default:
        throw error;
    }
  });

  process.on("SIGTERM", handleShutdown);
  process.on("SIGINT", handleShutdown);
}

function createSocketServer(
  server: ReturnType<typeof createServer>,
): SocketIOServer {
  return new SocketIOServer(server, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ["GET", "POST"],
    },
  });
}

function handleShutdown(signal: NodeJS.Signals): void {
  logger.info(`${signal} signal received`, {
    action: "shutting_down_gracefully",
  });
  process.exit(0);
}

void bootstrap();
