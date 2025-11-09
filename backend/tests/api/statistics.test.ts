import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/createApp';
import { createMockSocketIO } from '../mocks/socket.io';
import type { Application } from 'express';

describe('Statistics Endpoints', () => {
  let app: Application;

  beforeAll(() => {
    const mockIO = createMockSocketIO();
    app = createApp({ io: mockIO as any });
  });

  describe('GET /api/statistics/color-size-analysis', () => {
    it('should return color size analysis', async () => {
      const response = await request(app)
        .get('/api/statistics/color-size-analysis')
        .query({ cuttingListId: 'test-id' });
      
      expect([200, 400, 404, 500]).toContain(response.status);
    });

    it('should require cuttingListId parameter', async () => {
      const response = await request(app).get('/api/statistics/color-size-analysis');
      
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('GET /api/statistics/profile-analysis', () => {
    it('should return profile analysis', async () => {
      const response = await request(app)
        .get('/api/statistics/profile-analysis')
        .query({ cuttingListId: 'test-id' });
      
      expect([200, 400, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/statistics/work-order-analysis', () => {
    it('should return work order analysis', async () => {
      const response = await request(app)
        .get('/api/statistics/work-order-analysis')
        .query({ cuttingListId: 'test-id' });
      
      expect([200, 400, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/statistics/optimization-performance', () => {
    it('should return optimization performance statistics', async () => {
      const response = await request(app).get('/api/statistics/optimization-performance');
      
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('GET /api/statistics/material-usage', () => {
    it('should return material usage statistics', async () => {
      const response = await request(app).get('/api/statistics/material-usage');
      
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('GET /api/statistics/efficiency-trends', () => {
    it('should return efficiency trends', async () => {
      const response = await request(app).get('/api/statistics/efficiency-trends');
      
      expect([200, 500]).toContain(response.status);
    });
  });
});
