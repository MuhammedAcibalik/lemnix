/**
 * @fileoverview Progressive Controller
 * @module controllers/progressiveController
 * @version 1.0.0
 *
 * ⚡🔐 CRITICAL: Real-time progress tracking for secure operations
 * - WebSocket-based progress updates
 * - Maintains security throughout the process
 * - Real-time user feedback
 * - Memory-efficient streaming
 */

import { Request, Response } from "express";
import { Server as SocketIOServer } from "socket.io";
import { Prisma, ProductionPlanPriority } from "@prisma/client";
import { progressiveLoadingService } from "../services/progressiveLoadingService";
import { logger } from "../services/logger";
import { UserRole, Permission } from "../middleware/authorization";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
    sessionId: string;
    permissions: Permission[];
    tokenId: string;
  };
}

interface ProgressUpdate {
  sessionId: string;
  operation: "upload" | "retrieve";
  progress: {
    stage: string;
    percentage: number;
    message: string;
    itemsProcessed: number;
    totalItems: number;
    estimatedTimeRemaining?: number;
  };
  timestamp: number;
}

// ============================================================================
// PROGRESSIVE CONTROLLER
// ============================================================================

export class ProgressiveController {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Upload production plan with real-time progress
   * POST /api/production-plan/upload-progressive
   */
  async uploadProductionPlanProgressive(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: "Excel dosyası yüklenmedi",
        });
        return;
      }

      const userId = req.user?.userId;
      const sessionId = req.user?.sessionId || "anonymous";

      logger.info("Progressive upload started", {
        userId,
        sessionId,
        fileName: req.file.originalname,
        fileSize: req.file.size,
      });

      // Start progressive upload
      const result =
        await progressiveLoadingService.uploadProductionPlanProgressive(
          req.file.buffer,
          userId,
          {
            batchSize: 50,
            concurrency: 2,
            onProgress: (progress) => {
              // Send real-time progress update
              this.sendProgressUpdate(sessionId, "upload", progress);
            },
            onStageComplete: (stage, stageResult) => {
              logger.info("Upload stage completed", {
                sessionId,
                stage,
                result: stageResult,
              });
            },
          },
        );

      if (result.success) {
        const planId =
          result.data && typeof result.data === "object" && "id" in result.data
            ? (result.data as { id: string }).id
            : undefined;

        logger.info("Progressive upload completed successfully", {
          sessionId,
          planId,
          duration: `${result.duration}ms`,
          itemCount: result.progress.totalItems,
        });

        res.json({
          success: true,
          data: result.data,
          progress: result.progress,
          duration: result.duration,
        });
      } else {
        logger.error("Progressive upload failed", {
          sessionId,
          errors: result.errors,
          duration: result.duration,
        });

        res.status(500).json({
          success: false,
          errors: result.errors,
          progress: result.progress,
          duration: result.duration,
        });
      }
    } catch (error) {
      logger.error("Progressive upload error", {
        error: (error as Error).message,
        userId: req.user?.userId,
        sessionId: req.user?.sessionId,
      });

      res.status(500).json({
        success: false,
        error: "Progressive upload sırasında hata oluştu",
        details: (error as Error).message,
      });
    }
  }

  /**
   * Get production plans with real-time progress
   * GET /api/production-plan/progressive
   */
  async getProductionPlansProgressive(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const sessionId = req.user?.sessionId || "anonymous";
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 500);

      const filters: Prisma.ProductionPlanWhereInput = {};
      if (req.query.weekNumber) {
        const weekNumber = Number(req.query.weekNumber);
        if (!Number.isNaN(weekNumber)) {
          filters.weekNumber = weekNumber;
        }
      }
      if (req.query.year) {
        const year = Number(req.query.year);
        if (!Number.isNaN(year)) {
          filters.year = year;
        }
      }
      filters.status = (req.query.status as string) || "active";

      const itemFilters: Prisma.ProductionPlanItemWhereInput = {};
      if (req.query.bolum) {
        itemFilters.bolum = req.query.bolum as string;
      }
      if (req.query.oncelik) {
        const oncelikValue = req.query.oncelik as string;
        if (Object.values(ProductionPlanPriority).includes(oncelikValue as ProductionPlanPriority)) {
          itemFilters.oncelik = oncelikValue as ProductionPlanPriority;
        }
      }
      if (Object.keys(itemFilters).length > 0) {
        filters.items = {
          some: itemFilters,
        };
      }

      logger.info("Progressive retrieval started", {
        sessionId,
        filters,
      });

      // Start progressive retrieval
      const result =
        await progressiveLoadingService.getProductionPlansProgressive(
          filters,
          {
            batchSize: 100,
            concurrency: 3,
            onProgress: (progress) => {
              // Send real-time progress update
              this.sendProgressUpdate(sessionId, "retrieve", progress);
            },
            onStageComplete: (stage, stageResult) => {
              logger.info("Retrieval stage completed", {
                sessionId,
                stage,
                result: stageResult,
              });
            },
          },
          {
            page,
            limit,
          },
        );

      if (result.success) {
        logger.info("Progressive retrieval completed successfully", {
          sessionId,
          planCount: result.data?.length || 0,
          duration: `${result.duration}ms`,
          itemCount: result.progress.totalItems,
        });

        res.json({
          success: true,
          data: result.data,
          progress: result.progress,
          duration: result.duration,
        });
      } else {
        logger.error("Progressive retrieval failed", {
          sessionId,
          errors: result.errors,
          duration: result.duration,
        });

        res.status(500).json({
          success: false,
          errors: result.errors,
          progress: result.progress,
          duration: result.duration,
        });
      }
    } catch (error) {
      logger.error("Progressive retrieval error", {
        error: (error as Error).message,
        userId: req.user?.userId,
        sessionId: req.user?.sessionId,
      });

      res.status(500).json({
        success: false,
        error: "Progressive retrieval sırasında hata oluştu",
        details: (error as Error).message,
      });
    }
  }

  /**
   * Send progress update via WebSocket
   */
  private sendProgressUpdate(
    sessionId: string,
    operation: "upload" | "retrieve",
    progress: ProgressUpdate["progress"],
  ): void {
    try {
      const update: ProgressUpdate = {
        sessionId,
        operation,
        progress: {
          stage: progress.stage,
          percentage: progress.percentage,
          message: progress.message,
          itemsProcessed: progress.itemsProcessed,
          totalItems: progress.totalItems,
          estimatedTimeRemaining: progress.estimatedTimeRemaining,
        },
        timestamp: Date.now(),
      };

      // Send to specific session
      this.io.to(sessionId).emit("progress-update", update);

      // Also send to general room for monitoring
      this.io.to("admin").emit("progress-update", update);

      logger.debug("Progress update sent", {
        sessionId,
        operation,
        percentage: progress.percentage,
        stage: progress.stage,
      });
    } catch (error) {
      logger.error("Failed to send progress update", {
        error: (error as Error).message,
        sessionId,
        operation,
      });
    }
  }

  /**
   * Get current progress for a session
   * GET /api/production-plan/progress/:sessionId
   */
  async getProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const sessionId = req.params.sessionId;

      // In a real implementation, you'd store progress in Redis or similar
      // For now, we'll return a placeholder
      res.json({
        success: true,
        data: {
          sessionId,
          isActive: false,
          progress: null,
        },
      });
    } catch (error) {
      logger.error("Get progress error", {
        error: (error as Error).message,
        sessionId: req.params.sessionId,
      });

      res.status(500).json({
        success: false,
        error: "Progress bilgisi alınamadı",
        details: (error as Error).message,
      });
    }
  }
}

// ============================================================================
// WEBSOCKET HANDLERS
// ============================================================================

export function setupProgressiveWebSocket(io: SocketIOServer): void {
  io.on("connection", (socket) => {
    logger.info("Client connected to progressive updates", {
      socketId: socket.id,
      sessionId: socket.handshake.query.sessionId,
    });

    // Join session room
    const sessionId = socket.handshake.query.sessionId as string;
    if (sessionId) {
      socket.join(sessionId);
    }

    // Join admin room for monitoring
    socket.join("admin");

    socket.on("disconnect", () => {
      logger.info("Client disconnected from progressive updates", {
        socketId: socket.id,
        sessionId,
      });
    });

    socket.on("join-progress", (data: { sessionId: string }) => {
      socket.join(data.sessionId);
      logger.info("Client joined progress room", {
        socketId: socket.id,
        sessionId: data.sessionId,
      });
    });
  });
}
