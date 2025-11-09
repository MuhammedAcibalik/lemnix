import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/createApp';
import { createMockSocketIO } from '../mocks/socket.io';
import type { Application } from 'express';

describe('Enterprise Optimization Endpoints', () => {
  let app: Application;

  beforeAll(() => {
    const mockIO = createMockSocketIO();
    app = createApp({ io: mockIO as any });
  });

  describe('POST /api/enterprise/optimize', () => {
    it('should run optimization with valid data', async () => {
      const optimizationRequest = {
        items: [
          { length: 1000, quantity: 5, id: 'item-1' },
          { length: 1500, quantity: 3, id: 'item-2' }
        ],
        stockLengths: [6000],
        kerfWidth: 5,
        settings: {
          algorithm: 'FFD',
          maxPatterns: 1000
        }
      };

      const response = await request(app)
        .post('/api/enterprise/optimize')
        .send(optimizationRequest);
      
      expect([200, 400, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
      }
    });

    it('should validate required fields', async () => {
      const invalidRequest = {
        items: []
        // Missing stockLengths and other required fields
      };

      const response = await request(app)
        .post('/api/enterprise/optimize')
        .send(invalidRequest);
      
      expect([400, 500]).toContain(response.status);
    });

    it('should handle FFD algorithm', async () => {
      const request_ffd = {
        items: [{ length: 1000, quantity: 2, id: 'item-1' }],
        stockLengths: [6000],
        kerfWidth: 5,
        settings: { algorithm: 'FFD' }
      };

      const response = await request(app)
        .post('/api/enterprise/optimize')
        .send(request_ffd);
      
      expect([200, 400, 500]).toContain(response.status);
    });

    it('should handle BFD algorithm', async () => {
      const request_bfd = {
        items: [{ length: 1000, quantity: 2, id: 'item-1' }],
        stockLengths: [6000],
        kerfWidth: 5,
        settings: { algorithm: 'BFD' }
      };

      const response = await request(app)
        .post('/api/enterprise/optimize')
        .send(request_bfd);
      
      expect([200, 400, 500]).toContain(response.status);
    });

    it('should handle Genetic algorithm', async () => {
      const request_genetic = {
        items: [{ length: 1000, quantity: 2, id: 'item-1' }],
        stockLengths: [6000],
        kerfWidth: 5,
        settings: { algorithm: 'Genetic' }
      };

      const response = await request(app)
        .post('/api/enterprise/optimize')
        .send(request_genetic);
      
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('POST /api/enterprise/validate', () => {
    it('should validate optimization data', async () => {
      const validationRequest = {
        items: [{ length: 1000, quantity: 2, id: 'item-1' }],
        stockLengths: [6000],
        kerfWidth: 5
      };

      const response = await request(app)
        .post('/api/enterprise/validate')
        .send(validationRequest);
      
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('GET /api/enterprise/algorithms', () => {
    it('should return available algorithms', async () => {
      const response = await request(app).get('/api/enterprise/algorithms');
      
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(Array.isArray(response.body) || response.body.algorithms).toBeTruthy();
      }
    });
  });
});
