import express, { Request, Response, NextFunction } from 'express';
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

// Environment variables
dotenv.config();

// Environment validation
const requiredEnvVars = ['NODE_ENV'] as const;
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const app = express();
const PORT = parseInt(process.env['PORT'] || '3001', 10);
const NODE_ENV = process.env['NODE_ENV'] || 'development';
const FRONTEND_URL = process.env['FRONTEND_URL'] || 'http://localhost:3000';

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
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};

// CORS configuration
const corsConfig = {
  origin: [FRONTEND_URL, 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(helmet(helmetConfig));
app.use(cors(corsConfig));
app.use(compression());
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
    if (process.env['NODE_ENV'] !== 'production') {
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
      message: 'Endpoint bulunamadı',
      code: 'NOT_FOUND'
    }
  });
});

// Error handler
app.use((error: Error, _req: Request, res: Response<ApiResponse>, _next: NextFunction) => {
  console.error('Unhandled error:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({
    success: false,
    error: {
      message: NODE_ENV === 'development' ? error.message : 'Sunucu hatası',
      code: 'INTERNAL_SERVER_ERROR',
      details: NODE_ENV === 'development' ? error.stack : undefined
    }
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  if (process.env['NODE_ENV'] !== 'production') {
    console.log('🔄 SIGTERM received, shutting down gracefully...');
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  if (process.env['NODE_ENV'] !== 'production') {
    console.log('🔄 SIGINT received, shutting down gracefully...');
  }
  process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 LEMNİX Backend API çalışıyor: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Readiness check: http://localhost:${PORT}/readyz`);
  console.log(`🔧 Environment: ${NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
});

// Server error handling
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`❌ Port ${PORT} requires elevated privileges`);
      process.exit(1);
    case 'EADDRINUSE':
      console.error(`❌ Port ${PORT} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
});

export default app;
