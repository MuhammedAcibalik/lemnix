import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./server/createApp.js";
import { env } from "./config/env.js";
import { databaseManager } from "./config/database.js";
import { logger } from "./services/logger.js";
import { startQueryMonitoring } from "./middleware/queryMonitoring.js";
import { initializeSentry } from "./monitoring/sentry.js";
import { createOptimizationWorker } from "./workers/optimizationWorker.js";
import { createEncryptionWorker } from "./workers/encryptionWorker.js";
import { closeQueue } from "./config/queue.js";
import type { Worker } from "bullmq";

let httpServer: ReturnType<typeof createServer> | null = null;
let optimizationWorker: Worker | null = null;
let encryptionWorker: Worker | null = null;

async function bootstrap(): Promise<void> {
  // Initialize Sentry error tracking
  initializeSentry();

  // Initialize Prisma security middleware
  const { initializePrismaSecurityMiddleware } = await import("./middleware/prismaSecurity.js");
  initializePrismaSecurityMiddleware();

  httpServer = createServer();
  const io = createSocketServer(httpServer);
  const app = createApp({ io });

  httpServer.on("request", app);

  httpServer.listen(env.PORT, async () => {
    try {
      await databaseManager.connect();
      startQueryMonitoring();

      // Start optimization worker if queue is enabled
      if (process.env.ENABLE_OPTIMIZATION_QUEUE === "true") {
        try {
          optimizationWorker = createOptimizationWorker();
          logger.info("Optimization worker started", {
            concurrency: process.env.QUEUE_CONCURRENCY || "5",
            queueName: "optimization",
          });
        } catch (workerError) {
          logger.error("Failed to start optimization worker", workerError as Error);
          // Don't exit - server can still run without worker
        }
      } else {
        logger.info("Optimization queue disabled (ENABLE_OPTIMIZATION_QUEUE not set)");
      }

      // ✅ PERFORMANCE: Start encryption worker (always enabled for async encryption)
      try {
        encryptionWorker = createEncryptionWorker();
        logger.info("Encryption worker started", {
          concurrency: process.env.QUEUE_CONCURRENCY || "5",
          queueName: "encryption",
        });
      } catch (workerError) {
        logger.error("Failed to start encryption worker", workerError as Error);
        // Don't exit - server can still run without worker (will use sync encryption)
      }

      logger.info("LEMNİX Backend API running", {
        url: `http://localhost:${env.PORT}`,
        environment: env.NODE_ENV,
        frontendUrl: env.FRONTEND_URL,
        queueEnabled: process.env.ENABLE_OPTIMIZATION_QUEUE === "true",
      });
    } catch (error) {
      logger.error("Failed to start server", error as Error);
      process.exit(1);
    }
  });

  httpServer.on("error", async (error: NodeJS.ErrnoException) => {
    if (error.syscall !== "listen") {
      throw error;
    }

    switch (error.code) {
      case "EACCES":
        logger.error("Port requires elevated privileges", error, {
          port: env.PORT,
        });
        process.exit(1);
      case "EADDRINUSE":
        const isProduction = process.env.NODE_ENV === "production";

        if (isProduction) {
          // Production: Fail fast with clear error message
          // Do NOT attempt to kill processes - let orchestrator handle it
          logger.error(
            "Port is already in use. Application cannot start.",
            {
              port: env.PORT,
              environment: env.NODE_ENV,
              message:
                "In production, port conflicts should be resolved by the orchestrator (Docker/K8s). " +
                "Please check if another instance is running or if the port is configured incorrectly.",
            },
          );
          process.exit(1);
        } else {
          // Development: Attempt to free port (for local development convenience)
          logger.warn("Port is already in use, attempting to free it", {
            port: env.PORT,
            environment: env.NODE_ENV,
          });
          try {
            const { killProcessByPort, waitForPortRelease } = await import(
              "./utils/processManager.js"
            );

            const killed = await killProcessByPort(env.PORT, true);
            if (killed) {
              logger.info("Port freed, waiting for release", {
                port: env.PORT,
              });
              // Wait for port to be fully released (max 2 seconds)
              const released = await waitForPortRelease(env.PORT, 2000, 100);
              if (released) {
                logger.info(
                  "Port released successfully, nodemon will restart automatically",
                  {
                    port: env.PORT,
                  },
                );
                // Exit gracefully - nodemon will restart with delay (500ms from nodemon.json)
                process.exit(0);
              }
            }
          } catch (cleanupError) {
            logger.error(
              "Failed to free port automatically",
              cleanupError as Error,
            );
          }

          logger.error("Port is still in use after cleanup attempt", {
            port: env.PORT,
          });
          process.exit(1);
        }
      default:
        throw error;
    }
  });

  // Graceful shutdown handlers
  process.on("SIGTERM", () => {
    void handleShutdown("SIGTERM");
  });
  process.on("SIGINT", () => {
    void handleShutdown("SIGINT");
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error: Error) => {
    logger.error("Uncaught exception", error);
    void handleShutdown("uncaughtException");
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason: unknown) => {
    logger.error("Unhandled rejection", reason as Error);
    void handleShutdown("unhandledRejection");
  });
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

let isShuttingDown = false;

async function handleShutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    logger.warn("Shutdown already in progress, forcing exit");
    process.exit(1);
  }

  isShuttingDown = true;
  logger.info(`${signal} signal received`, {
    action: "shutting_down_gracefully",
  });

  const shutdownTimeout = setTimeout(() => {
    logger.error("Shutdown timeout exceeded, forcing exit");
    process.exit(1);
  }, 30000); // 30 seconds timeout

  try {
    // Close HTTP server
    if (httpServer) {
      const server = httpServer;
      await new Promise<void>((resolve) => {
        server.close(() => {
          logger.info("HTTP server closed");
          resolve();
        });
      });
    }

    // Close optimization worker
    if (optimizationWorker) {
      await optimizationWorker.close();
      logger.info("Optimization worker closed");
    }

    // Close encryption worker
    if (encryptionWorker) {
      await encryptionWorker.close();
      logger.info("Encryption worker closed");
    }

    // Close queue connections
    await closeQueue();

    // Disconnect database
    await databaseManager.disconnect();

    clearTimeout(shutdownTimeout);
    logger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown", error as Error);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
}

void bootstrap();
