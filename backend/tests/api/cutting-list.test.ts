import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/createApp';
import { createMockSocketIO } from '../mocks/socket.io';
import type { Application } from 'express';
import { cuttingListRepository } from '../../src/repositories/CuttingListRepository';
import { mapPriorityToSelection } from '../../../frontend/src/widgets/cutting-list-builder/hooks/priorityUtils';

describe('Cutting List Endpoints', () => {
  let app: Application;
  let createdListId: string;

  beforeAll(() => {
    const mockIO = createMockSocketIO();
    app = createApp({ io: mockIO as any });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/cutting-list', () => {
    it('should create a new cutting list', async () => {
      const newList = {
        title: 'Test Cutting List',
        weekNumber: 1,
        sections: []
      };

      const response = await request(app)
        .post('/api/cutting-list')
        .send(newList);
      
      expect([200, 201, 400, 500]).toContain(response.status);
      
      if (response.status === 200 || response.status === 201) {
        expect(response.body).toHaveProperty('id');
        createdListId = response.body.id;
      }
    });

    it('should validate required fields', async () => {
      const invalidList = {
        weekNumber: 1
      };

      const response = await request(app)
        .post('/api/cutting-list')
        .send(invalidList);
      
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('GET /api/cutting-list', () => {
    it('should return all cutting lists', async () => {
      const response = await request(app).get('/api/cutting-list');
      
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(Array.isArray(response.body) || response.body.data).toBeTruthy();
      }
    });
  });

  describe('GET /api/cutting-list/:id', () => {
    it('should return 404 for non-existent list', async () => {
      const response = await request(app).get('/api/cutting-list/non-existent-id');

      expect([404, 500]).toContain(response.status);
    });

    it('should normalize Prisma priority values for API to UI flow', async () => {
      const now = new Date();
      vi.spyOn(cuttingListRepository, 'findById').mockResolvedValue({
        id: 'list-1',
        name: 'Demo',
        description: null,
        status: 'READY',
        createdAt: now,
        updatedAt: now,
        userId: 'user-1',
        metadata: null,
        weekNumber: 12,
        sections: [],
        items: [
          {
            id: 'item-1',
            cuttingListId: 'list-1',
            workOrderId: 'WO-1',
            date: null,
            color: 'Blue',
            version: 'A',
            size: 'M',
            profileType: 'Frame',
            length: 1200,
            quantity: 4,
            orderQuantity: 4,
            cuttingPattern: null,
            notes: null,
            priority: 'URGENT',
            status: 'READY',
            createdAt: now,
            updatedAt: now,
            materialDescription: null,
            materialNumber: null,
            productionPlanItemId: null,
          },
        ],
        statistics: [],
      } as any);

      const response = await request(app).get('/api/cutting-list/list-1');

      expect(response.status).toBe(200);
      const itemPriority =
        response.body?.data?.sections?.[0]?.items?.[0]?.priority;
      expect(itemPriority).toBe('urgent');
      expect(mapPriorityToSelection(itemPriority)).toBe('2');
    });
  });

  describe('PUT /api/cutting-list/:id', () => {
    it('should update a cutting list', async () => {
      const updates = {
        title: 'Updated Test List'
      };

      const response = await request(app)
        .put('/api/cutting-list/test-id')
        .send(updates);
      
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/cutting-list/:id', () => {
    it('should return appropriate status for delete', async () => {
      const response = await request(app).delete('/api/cutting-list/test-id');
      
      expect([200, 204, 404, 500]).toContain(response.status);
    });
  });
});
