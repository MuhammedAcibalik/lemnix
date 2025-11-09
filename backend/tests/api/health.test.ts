import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/createApp';
import { createMockSocketIO } from '../mocks/socket.io';
import type { Application } from 'express';

describe('Health & Metrics Endpoints', () => {
  let app: Application;

  beforeAll(() => {
    const mockIO = createMockSocketIO();
    app = createApp({ io: mockIO as any });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app).get('/api/health/ready');
      
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('GET /api/health/live', () => {
    it('should return liveness status', async () => {
      const response = await request(app).get('/api/health/live');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('GET /api/metrics', () => {
    it('should return system metrics', async () => {
      const response = await request(app).get('/api/metrics');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
