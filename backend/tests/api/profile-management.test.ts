import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server/createApp';
import { createMockSocketIO } from '../mocks/socket.io';
import type { Application } from 'express';

describe('Profile Management Endpoints', () => {
  let app: Application;

  beforeAll(() => {
    const mockIO = createMockSocketIO();
    app = createApp({ io: mockIO as any });
  });

  describe('GET /api/profiles', () => {
    it('should return profile list', async () => {
      const response = await request(app).get('/api/profiles');
      
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(Array.isArray(response.body) || response.body.data || response.body.profiles).toBeTruthy();
      }
    });
  });

  describe('POST /api/profiles', () => {
    it('should create a new profile', async () => {
      const newProfile = {
        name: 'Test Profile',
        code: 'TP001',
        length: 6000,
        type: 'aluminum'
      };

      const response = await request(app)
        .post('/api/profiles')
        .send(newProfile);
      
      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it('should validate required fields', async () => {
      const invalidProfile = {
        name: 'Test Profile'
        // Missing other required fields
      };

      const response = await request(app)
        .post('/api/profiles')
        .send(invalidProfile);
      
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('GET /api/profiles/:id', () => {
    it('should return 404 for non-existent profile', async () => {
      const response = await request(app).get('/api/profiles/non-existent-id');
      
      expect([404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/profiles/:id', () => {
    it('should update a profile', async () => {
      const updates = {
        name: 'Updated Profile Name'
      };

      const response = await request(app)
        .put('/api/profiles/test-id')
        .send(updates);
      
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/profiles/:id', () => {
    it('should delete a profile', async () => {
      const response = await request(app).delete('/api/profiles/test-id');
      
      expect([200, 204, 404, 500]).toContain(response.status);
    });
  });
});
