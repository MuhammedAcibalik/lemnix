import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';

import { createApp } from '../../src/server/createApp';
import { createMockSocketIO } from '../mocks/socket.io';
import { sessionManager } from '../../src/middleware/authentication';
import { UserRole, generateToken } from '../../src/middleware/authorization';

describe('Progressive Routes Session Enforcement', () => {
  let app: Application;

  beforeAll(() => {
    const mockIO = createMockSocketIO();
    app = createApp({ io: mockIO as any });

    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_EXPIRES_IN = '15m';
  });

  afterEach(() => {
    sessionManager.invalidateUserSessions('progressive-test-user');
    sessionManager.invalidateUserSessions('progressive-invalid-user');
  });

  it('should reject requests without an authentication token', async () => {
    const response = await request(app).get('/api/production-plan/progressive');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: 'Unauthorized',
      message: 'Access token required'
    });
  });

  it('should reject requests when the session is invalidated', async () => {
    const userId = 'progressive-invalid-user';
    const sessionId = sessionManager.createSession(userId, UserRole.ADMIN);
    const token = generateToken(userId, UserRole.ADMIN, sessionId);

    sessionManager.invalidateSession(sessionId);

    const response = await request(app)
      .get('/api/production-plan/progressive')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: 'Unauthorized',
      message: 'Session expired or invalid'
    });
  });

  it('should allow requests with a valid session', async () => {
    const userId = 'progressive-test-user';
    const sessionId = sessionManager.createSession(userId, UserRole.ADMIN);
    const token = generateToken(userId, UserRole.ADMIN, sessionId);

    const response = await request(app)
      .get('/api/production-plan/progressive')
      .set('Authorization', `Bearer ${token}`);

    expect([200, 400, 404, 500]).toContain(response.status);
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
  });
});
