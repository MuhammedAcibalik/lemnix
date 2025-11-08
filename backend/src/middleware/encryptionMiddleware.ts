/**
 * @fileoverview Encryption Middleware
 * @module middleware/encryptionMiddleware
 * @version 1.0.0
 * 
 * 🔐 CRITICAL SECURITY: This middleware handles automatic encryption/decryption
 * - Automatically encrypts sensitive data on write operations
 * - Automatically decrypts sensitive data on read operations
 * - Transparent to application logic
 * - Maintains data integrity
 */

import { Request, Response, NextFunction } from 'express';
import { encryptionService, encryptField, decryptField, encryptMetadata, decryptMetadata } from '../services/encryptionService';
import { logger } from '../services/logger';

// ============================================================================
// SENSITIVE FIELD MAPPINGS
// ============================================================================

const SENSITIVE_FIELDS: Record<string, string[]> = {
  'users': ['email', 'name'],
  'production_plan_items': [
    'siparisVeren',
    'musteriNo', 
    'musteriKalemi',
    'siparis',
    'malzemeNo',
    'malzemeKisaMetni'
  ],
  'material_profile_mappings': [
    'malzemeNo',
    'malzemeKisaMetni'
  ]
};

const METADATA_FIELDS: Record<string, string[]> = {
  'cutting_lists': ['metadata'],
  'optimizations': ['parameters', 'result', 'metadata'],
  'production_plans': ['metadata'],
  'suggestion_patterns': ['contexts', 'variations', 'ratioHistory', 'metadata'],
  'suggestion_caches': ['data'],
  'suggestion_metrics': ['metadata'],
  'system_metrics': ['metadata'],
  'user_activities': ['activityData']
};

// ============================================================================
// ENCRYPTION MIDDLEWARE
// ============================================================================

/**
 * Middleware to encrypt sensitive data before database write operations
 */
export const encryptDataMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Only process POST, PUT, PATCH requests
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
      next();
      return;
    }

    const tableName = getTableNameFromPath(req.path);
    if (!tableName) {
      next();
      return;
    }

    // Encrypt sensitive fields in request body
    if (req.body && typeof req.body === 'object') {
      req.body = encryptRequestBody(req.body, tableName);
    }

    // Encrypt sensitive fields in request query (for bulk operations)
    if (req.query && typeof req.query === 'object') {
      req.query = encryptRequestQuery(req.query, tableName);
    }

    logger.debug('Data encrypted for write operation', {
      tableName,
      method: req.method,
      path: req.path,
      hasBody: !!req.body,
      hasQuery: !!req.query
    });

    next();
  } catch (error) {
    logger.error('Encryption middleware error', {
      error: (error as Error).message,
      path: req.path,
      method: req.method
    });
    next();
  }
};

/**
 * Middleware to decrypt sensitive data after database read operations
 */
export const decryptDataMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Only process GET requests
    if (req.method !== 'GET') {
      next();
      return;
    }

    const tableName = getTableNameFromPath(req.path);
    if (!tableName) {
      next();
      return;
    }

    // Store original send function
    const originalSend = res.send;

    // Override send function to decrypt response data
    res.send = function(data: any) {
      try {
        if (data && typeof data === 'string') {
          // Try to parse JSON response
          const parsed = JSON.parse(data);
          const decrypted = decryptResponseData(parsed, tableName);
          return originalSend.call(this, JSON.stringify(decrypted));
        } else if (data && typeof data === 'object') {
          const decrypted = decryptResponseData(data, tableName);
          return originalSend.call(this, decrypted);
        }
        return originalSend.call(this, data);
      } catch (error) {
        logger.warn('Failed to decrypt response data', {
          error: (error as Error).message,
          tableName,
          path: req.path
        });
        return originalSend.call(this, data);
      }
    };

    next();
  } catch (error) {
    logger.error('Decryption middleware error', {
      error: (error as Error).message,
      path: req.path,
      method: req.method
    });
    next();
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get table name from request path
 */
function getTableNameFromPath(path: string): string | null {
  // Map API paths to table names
  const pathToTableMap: Record<string, string> = {
    '/production-plan': 'production_plans',
    '/production-plan/upload': 'production_plan_items',
    '/cutting-list': 'cutting_lists',
    '/optimization': 'optimizations',
    '/user': 'users',
    '/material-profile-mapping': 'material_profile_mappings'
  };

  for (const [apiPath, tableName] of Object.entries(pathToTableMap)) {
    if (path.startsWith(apiPath)) {
      return tableName;
    }
  }

  return null;
}

/**
 * Encrypt sensitive fields in request body
 */
function encryptRequestBody(body: any, tableName: string): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = SENSITIVE_FIELDS[tableName] || [];
  const metadataFields = METADATA_FIELDS[tableName] || [];
  const encrypted = { ...body };

  // Encrypt sensitive fields
  for (const field of sensitiveFields) {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = encryptField(encrypted[field]);
    }
  }

  // Encrypt metadata fields
  for (const field of metadataFields) {
    if (encrypted[field] && typeof encrypted[field] === 'object') {
      encrypted[field] = encryptMetadata(encrypted[field]);
    }
  }

  // Handle array of objects (bulk operations)
  if (Array.isArray(encrypted)) {
    return encrypted.map(item => 
      typeof item === 'object' ? encryptRequestBody(item, tableName) : item
    );
  }

  // Handle nested objects
  for (const key in encrypted) {
    if (typeof encrypted[key] === 'object' && encrypted[key] !== null) {
      if (Array.isArray(encrypted[key])) {
        encrypted[key] = encrypted[key].map((item: any) => 
          typeof item === 'object' ? encryptRequestBody(item, tableName) : item
        );
      } else {
        encrypted[key] = encryptRequestBody(encrypted[key], tableName);
      }
    }
  }

  return encrypted;
}

/**
 * Encrypt sensitive fields in request query
 */
function encryptRequestQuery(query: any, tableName: string): any {
  if (!query || typeof query !== 'object') {
    return query;
  }

  const sensitiveFields = SENSITIVE_FIELDS[tableName] || [];
  const encrypted = { ...query };

  for (const field of sensitiveFields) {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = encryptField(encrypted[field]);
    }
  }

  return encrypted;
}

/**
 * Decrypt sensitive fields in response data
 */
function decryptResponseData(data: any, tableName: string): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = SENSITIVE_FIELDS[tableName] || [];
  const metadataFields = METADATA_FIELDS[tableName] || [];
  const decrypted = { ...data };

  // Decrypt sensitive fields
  for (const field of sensitiveFields) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      decrypted[field] = decryptField(decrypted[field]);
    }
  }

  // Decrypt metadata fields
  for (const field of metadataFields) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      decrypted[field] = decryptMetadata(decrypted[field]);
    }
  }

  // Handle array of objects
  if (Array.isArray(decrypted)) {
    return decrypted.map(item => 
      typeof item === 'object' ? decryptResponseData(item, tableName) : item
    );
  }

  // Handle nested objects
  for (const key in decrypted) {
    if (typeof decrypted[key] === 'object' && decrypted[key] !== null) {
      if (Array.isArray(decrypted[key])) {
        decrypted[key] = decrypted[key].map((item: any) => 
          typeof item === 'object' ? decryptResponseData(item, tableName) : item
        );
      } else {
        decrypted[key] = decryptResponseData(decrypted[key], tableName);
      }
    }
  }

  return decrypted;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Manually encrypt data for a specific table
 */
export function encryptDataForTable(data: any, tableName: string): any {
  return encryptRequestBody(data, tableName);
}

/**
 * Manually decrypt data for a specific table
 */
export function decryptDataForTable(data: any, tableName: string): any {
  return decryptResponseData(data, tableName);
}

/**
 * Check if field should be encrypted for a table
 */
export function isSensitiveField(tableName: string, fieldName: string): boolean {
  const sensitiveFields = SENSITIVE_FIELDS[tableName] || [];
  return sensitiveFields.includes(fieldName);
}

/**
 * Check if field contains metadata that should be encrypted
 */
export function isMetadataField(tableName: string, fieldName: string): boolean {
  const metadataFields = METADATA_FIELDS[tableName] || [];
  return metadataFields.includes(fieldName);
}
