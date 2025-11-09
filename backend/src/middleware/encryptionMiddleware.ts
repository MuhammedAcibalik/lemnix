/**
 * @fileoverview Encryption Middleware
 * @module middleware/encryptionMiddleware
 */

import { Request, Response, NextFunction } from "express";
import {
  encryptField,
  decryptField,
  encryptMetadata,
  decryptMetadata,
} from "../services/encryptionService";
import { logger } from "../services/logger";
import {
  resolveDataProtection,
  DataProtectionContext,
} from "../security/dataProtectionConfig";

/**
 * Middleware to encrypt sensitive data before database write operations
 */
export const encryptDataMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    if (!["POST", "PUT", "PATCH"].includes(req.method)) {
      next();
      return;
    }

    const context = resolveDataProtection(req);
    if (!context) {
      next();
      return;
    }

    if (req.body && typeof req.body === "object") {
      req.body = encryptPayload(req.body, context);
    }

    logger.debug("Data encrypted for write operation", {
      tableName: context.table,
      method: req.method,
      path: req.path,
    });

    next();
  } catch (error) {
    logger.error("Encryption middleware error", error as Error, {
      path: req.path,
      method: req.method,
    });
    next();
  }
};

/**
 * Middleware to decrypt sensitive data after database read operations
 */
export const decryptDataMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    if (req.method !== "GET") {
      next();
      return;
    }

    const context = resolveDataProtection(req);
    if (!context) {
      next();
      return;
    }

    const originalJson = res.json.bind(res);
    res.json = function (data: unknown) {
      try {
        const decrypted = decryptPayload(data, context);
        return originalJson(decrypted);
      } catch (error) {
        logger.warn("Failed to decrypt response data", {
          error: (error as Error).message,
          tableName: context.table,
          path: req.path,
        });
        return originalJson(data as unknown);
      }
    };

    next();
  } catch (error) {
    logger.error("Decryption middleware error", error as Error, {
      path: req.path,
      method: req.method,
    });
    next();
  }
};

function encryptPayload(payload: unknown, context: DataProtectionContext): unknown {
  if (Array.isArray(payload)) {
    return payload.map((item) => encryptPayload(item, context));
  }

  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const encrypted: Record<string, unknown> = { ...(payload as Record<string, unknown>) };

  for (const field of context.sensitiveFields) {
    if (typeof encrypted[field] === "string") {
      encrypted[field] = encryptField(encrypted[field] as string);
    }
  }

  for (const field of context.metadataFields) {
    if (encrypted[field] && typeof encrypted[field] === "object") {
      encrypted[field] = encryptMetadata(encrypted[field]);
    }
  }

  return encrypted;
}

function decryptPayload(payload: unknown, context: DataProtectionContext): unknown {
  if (Array.isArray(payload)) {
    return payload.map((item) => decryptPayload(item, context));
  }

  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const decrypted: Record<string, unknown> = { ...(payload as Record<string, unknown>) };

  for (const field of context.sensitiveFields) {
    if (typeof decrypted[field] === "string") {
      decrypted[field] = decryptField(decrypted[field] as string);
    }
  }

  for (const field of context.metadataFields) {
    if (typeof decrypted[field] === "string") {
      decrypted[field] = decryptMetadata(decrypted[field] as string);
    }
  }

  return decrypted;
}

export function encryptDataForTable(
  data: unknown,
  tableName: string,
  context?: DataProtectionContext,
): unknown {
  const protection = context ?? {
    table: tableName,
    sensitiveFields: [],
    metadataFields: [],
  };
  return encryptPayload(data, protection);
}

export function decryptDataForTable(
  data: unknown,
  tableName: string,
  context?: DataProtectionContext,
): unknown {
  const protection = context ?? {
    table: tableName,
    sensitiveFields: [],
    metadataFields: [],
  };
  return decryptPayload(data, protection);
}
