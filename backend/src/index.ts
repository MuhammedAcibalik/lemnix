import express, { type Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import enterpriseOptimizationRoutes from './routes/enterpriseOptimizationRoutes';
import cuttingListRoutes from './routes/cuttingListRoutes';
import webgpuRoutes from './routes/webgpuRoutes';
import errorMetricsRoutes from './routes/errorMetricsRoutes';
import statisticsRoutes from './routes/statisticsRoutes';
import metricsRoutes from './routes/metricsRoutes'; // ✅ P3-12: Web Vitals
import healthRoutes from './routes/healthRoutes'; // Health monitoring
import suggestionRoutes from './routes/suggestionRoutes'; // ✅ Smart Suggestions
import dashboardRoutes from './routes/dashboardRoutesV2'; // ✅ Dashboard v2.0 - Complete Reboot
import productionPlanRoutes from './routes/productionPlanRoutes'; // ✅ Production Plan Management
import { materialProfileMappingRoutes } from './routes/materialProfileMappingRoutes'; // ✅ Material Profile Mapping
import { createProgressiveRoutes } from './routes/progressiveRoutes'; // ✅ Progressive Loading
import profileManagementRoutes from './routes/profileManagementRoutes'; // ✅ Profile Management
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { databaseManager } from './config/database';
import { logger } from './services/logger';
import { correlationIdMiddleware, requestTimingMiddleware } from './middleware/correlationId';
import { createErrorHandler } from './middleware/errorHandler';
import { etagMiddleware } from './middleware/caching'; // ✅ P2-7: HTTP caching
import { env, isDevelopment } from './config/env';
import { startQueryMonitoring } from './middleware/queryMonitoring';
// 🔐 CRITICAL SECURITY: Encryption and Audit middleware
import { encryptDataMiddleware, decryptDataMiddleware } from './middleware/encryptionMiddleware';
import { auditMiddleware, auditDataModificationMiddleware, auditSecurityMiddleware } from './middleware/auditMiddleware';

// Load environment variables
dotenv.config();

// Environment validation happens automatically on import of env
// If validation fails, the app will crash with a detailed error message

const app: Express = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

const PORT = env.PORT;
const NODE_ENV = env.NODE_ENV;
const FRONTEND_URL = env.FRONTEND_URL;

// Type definitions
interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version: string;
  environment: string;
  uptime: number;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
}

// Helper function removed - no longer needed

// Security middleware configuration
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: 'same-origin' as const },
  crossOriginResourcePolicy: { policy: 'same-origin' as const },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' as const },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' as const },
  referrerPolicy: { policy: 'no-referrer' as const },
  xssFilter: true,
};

// CORS configuration
const corsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173', // Vite dev server
      'http://localhost:3001',
      'https://www.lemnix.com',
      'https://lemnix.com'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked origin', { origin, allowedOrigins });
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-API-Key',
    'X-Client-Version',
    'X-Request-ID'
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-Response-Time',
    'X-Rate-Limit-Remaining'
  ],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware
app.use(helmet(helmetConfig));
app.use(cors(corsConfig));
app.use(compression());

// Correlation ID and request timing (must be early in the chain)
app.use(correlationIdMiddleware);
app.use(requestTimingMiddleware);

// 🔐 CRITICAL SECURITY: Encryption and Audit middleware (must be early)
app.use(auditMiddleware);
app.use(auditSecurityMiddleware);
app.use(encryptDataMiddleware);
app.use(decryptDataMiddleware);

// ✅ P2-7: ETag caching middleware (after timing, before routes)
app.use(etagMiddleware);

app.use(morgan('combined', {
  skip: (req) => req.path === '/health' || req.path === '/readyz'
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  const start = Date.now();
  req.on('end', () => {
    const duration = Date.now() - start;
    if (isDevelopment) {
      console.log(`${req.method} ${req.path} - ${duration}ms`);
    }
  });
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response<HealthResponse>) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'LEMNİX Backend API',
    version: '1.0.0',
    environment: NODE_ENV,
    uptime: process.uptime()
  });
});

// Readiness check endpoint
app.get('/readyz', (_req: Request, res: Response): void => {
  try {
    // Check if uploads directory is accessible
    const uploadsDir = path.join(process.cwd(), '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      res.status(503).json({ status: 'NOT_READY', reason: 'Uploads directory not accessible' });
      return;
    }
    
    res.status(200).json({ status: 'READY' });
  } catch (error) {
    res.status(503).json({ status: 'NOT_READY', reason: 'System check failed' });
  }
});

// API Routes
// Routes - Cutting List (Ana Sistem) öncelikli
app.use('/api/cutting-list', cuttingListRoutes);
app.use('/api/enterprise', enterpriseOptimizationRoutes); // Enterprise Grade Optimization
app.use('/api/webgpu', webgpuRoutes); // WebGPU Optimization Routes
app.use('/api/error-metrics', errorMetricsRoutes); // Error Metrics for Monitoring
app.use('/api/dashboard', dashboardRoutes); // ✅ Dashboard v2.0 - Optimization-First Design
app.use('/api/statistics', statisticsRoutes); // Statistics & Analytics API
app.use('/api/metrics', metricsRoutes); // ✅ P3-12: Performance Metrics (Web Vitals)
app.use('/api/health', healthRoutes); // Health monitoring endpoints
app.use('/api/suggestions', suggestionRoutes); // ✅ Smart Suggestions (Unified)
app.use('/api/production-plan', productionPlanRoutes); // ✅ Production Plan Management
app.use('/api/production-plan', createProgressiveRoutes(io)); // ✅ Progressive Loading
app.use('/api/material-profile-mappings', materialProfileMappingRoutes); // ✅ Material Profile Mapping
app.use('/api/profile-management', profileManagementRoutes); // ✅ Profile Management

// Debug endpoint removed - ExcelDebugAnalyzer no longer exists

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'LEMNİX Alüminyum Kesim Optimizasyonu API',
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      health: '/health',
      ready: '/readyz',
      excel: '/api/excel',
      cuttingList: '/api/cutting-list',
      debug: '/debug-excel'
    }
  });
});

// 404 handler
app.use('*', (_req: Request, res: Response<ApiResponse>) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Endpoint not found',
      code: 'NOT_FOUND'
    }
  });
});

// Error handler with taxonomy and masking
const errorHandler = createErrorHandler({
  logger: logger,
  enableStackTrace: NODE_ENV === 'development',
  enableDetailedErrors: NODE_ENV === 'development',
  maxErrorRate: 100 // errors per minute
});

app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received', { action: 'shutting_down_gracefully' });
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received', { action: 'shutting_down_gracefully' });
  process.exit(0);
});

// Start server
server.listen(PORT, async () => {
  try {
    // Initialize database
    await databaseManager.connect();
    await databaseManager.initialize();
    
    // Start query performance monitoring
    startQueryMonitoring();
    logger.info('Query monitoring started (5-minute intervals)');
    
    logger.info('LEMNİX Backend API running', {
      url: `http://localhost:${PORT}`,
      environment: NODE_ENV,
      frontendUrl: FRONTEND_URL,
      database: 'PostgreSQL 18.0'
    });
    
    logger.info('Health check endpoint available', {
      url: `http://localhost:${PORT}/health`,
    });
    
    logger.info('Readiness check endpoint available', {
      url: `http://localhost:${PORT}/readyz`,
    });
    
    logger.info('Database connection established', {
      status: 'connected_and_initialized',
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
});

// Server error handling
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      logger.error('Port requires elevated privileges', error, { port: PORT });
      process.exit(1);
    case 'EADDRINUSE':
      logger.error('Port is already in use', error, { port: PORT });
      process.exit(1);
    default:
      throw error;
  }
});

export default app;
