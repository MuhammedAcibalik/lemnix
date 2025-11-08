import { UserRole } from './authorization';

export interface SessionRecord {
  sessionId: string;
  userId: string;
  role: UserRole;
  createdAt: number;
  lastActivity: number;
  tokenIds: Set<string>;
  isActive: boolean;
}

export interface SessionStore {
  create(session: SessionRecord): void;
  update(sessionId: string, update: Partial<SessionRecord>): void;
  find(sessionId: string): SessionRecord | undefined;
  delete(sessionId: string): void;
  findByUser(userId: string): SessionRecord[];
}

export class InMemorySessionStore implements SessionStore {
  private sessions = new Map<string, SessionRecord>();
  private userSessions = new Map<string, Set<string>>();

  create(session: SessionRecord): void {
    this.sessions.set(session.sessionId, session);
    if (!this.userSessions.has(session.userId)) {
      this.userSessions.set(session.userId, new Set());
    }
    this.userSessions.get(session.userId)!.add(session.sessionId);
  }

  update(sessionId: string, update: Partial<SessionRecord>): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }
    const merged = { ...session, ...update } as SessionRecord;
    this.sessions.set(sessionId, merged);
  }

  find(sessionId: string): SessionRecord | undefined {
    return this.sessions.get(sessionId);
  }

  delete(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }
    this.sessions.delete(sessionId);
    const userSet = this.userSessions.get(session.userId);
    if (userSet) {
      userSet.delete(sessionId);
      if (userSet.size === 0) {
        this.userSessions.delete(session.userId);
      }
    }
  }

  findByUser(userId: string): SessionRecord[] {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) {
      return [];
    }
    return Array.from(sessionIds)
      .map(id => this.sessions.get(id))
      .filter((session): session is SessionRecord => Boolean(session));
  }
}
