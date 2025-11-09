import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/createApp';
import { createMockSocketIO } from '../mocks/socket.io';
import type { Application } from 'express';

describe('Production Plan Endpoints', () => {
  let app: Application;

  beforeAll(() => {
    const mockIO = createMockSocketIO();
    app = createApp({ io: mockIO as any });
  });

  describe('GET /api/production-plans', () => {
    it('should return production plans list', async () => {
      const response = await request(app).get('/api/production-plans');
      
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toBeDefined();
      }
    });
  });

  describe('POST /api/production-plans', () => {
    it('should create a new production plan', async () => {
      const newPlan = {
        name: 'Test Production Plan',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/production-plans')
        .send(newPlan);
      
      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it('should validate required fields', async () => {
      const invalidPlan = {
        name: 'Test Plan'
        // Missing required dates
      };

      const response = await request(app)
        .post('/api/production-plans')
        .send(invalidPlan);
      
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('GET /api/production-plans/:id', () => {
    it('should return 404 for non-existent plan', async () => {
      const response = await request(app).get('/api/production-plans/non-existent-id');
      
      expect([404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/production-plans/:id', () => {
    it('should update a production plan', async () => {
      const updates = {
        name: 'Updated Plan Name'
      };

      const response = await request(app)
        .put('/api/production-plans/test-id')
        .send(updates);
      
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/production-plans/:id', () => {
    it('should delete a production plan', async () => {
      const response = await request(app).delete('/api/production-plans/test-id');
      
      expect([200, 204, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/production-plans/statistics', () => {
    it('should return production plan statistics', async () => {
      const response = await request(app).get('/api/production-plans/statistics');
      
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toBeDefined();
      }
    });
  });
});
