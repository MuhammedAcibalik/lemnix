import Redis from "ioredis";
import { env, isProduction } from "../config/env";
import { logger } from "../services/logger";
import { UserRole } from "./authorization";

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
  create(session: SessionRecord): Promise<void>;
  update(sessionId: string, update: Partial<SessionRecord>): Promise<void>;
  find(sessionId: string): Promise<SessionRecord | undefined>;
  delete(sessionId: string): Promise<void>;
  findByUser(userId: string): Promise<SessionRecord[]>;
}

export class InMemorySessionStore implements SessionStore {
  private sessions = new Map<string, SessionRecord>();
  private userSessions = new Map<string, Set<string>>();

  async create(session: SessionRecord): Promise<void> {
    this.sessions.set(session.sessionId, session);
    if (!this.userSessions.has(session.userId)) {
      this.userSessions.set(session.userId, new Set());
    }
    this.userSessions.get(session.userId)!.add(session.sessionId);
  }

  async update(
    sessionId: string,
    update: Partial<SessionRecord>,
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }
    const merged = { ...session, ...update } as SessionRecord;
    this.sessions.set(sessionId, merged);
  }

  async find(sessionId: string): Promise<SessionRecord | undefined> {
    return this.sessions.get(sessionId);
  }

  async delete(sessionId: string): Promise<void> {
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

  async findByUser(userId: string): Promise<SessionRecord[]> {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) {
      return [];
    }
    return Array.from(sessionIds)
      .map((id) => this.sessions.get(id))
      .filter((session): session is SessionRecord => Boolean(session));
  }
}

const SESSION_KEY_PREFIX = "session:";
const USER_SESSIONS_KEY_PREFIX = "user_sessions:";

function serializeSession(session: SessionRecord): string {
  return JSON.stringify({
    ...session,
    tokenIds: Array.from(session.tokenIds),
  });
}

function deserializeSession(data: string | null): SessionRecord | undefined {
  if (!data) {
    return undefined;
  }

  const parsed = JSON.parse(data) as Omit<SessionRecord, "tokenIds"> & {
    tokenIds: string[];
  };

  return {
    ...parsed,
    tokenIds: new Set(parsed.tokenIds ?? []),
  } satisfies SessionRecord;
}

function sessionKey(sessionId: string): string {
  return `${SESSION_KEY_PREFIX}${sessionId}`;
}

function userSessionsKey(userId: string): string {
  return `${USER_SESSIONS_KEY_PREFIX}${userId}`;
}

export class RedisSessionStore implements SessionStore {
  constructor(private readonly client: Redis) {}

  async create(session: SessionRecord): Promise<void> {
    await this.client.set(
      sessionKey(session.sessionId),
      serializeSession(session),
    );
    await this.client.sadd(userSessionsKey(session.userId), session.sessionId);
  }

  async update(
    sessionId: string,
    update: Partial<SessionRecord>,
  ): Promise<void> {
    const existing = await this.find(sessionId);
    if (!existing) {
      return;
    }

    const merged: SessionRecord = {
      ...existing,
      ...update,
      tokenIds:
        update.tokenIds !== undefined
          ? new Set(update.tokenIds)
          : existing.tokenIds,
    };

    await this.client.set(sessionKey(sessionId), serializeSession(merged));

    if (existing.userId !== merged.userId) {
      await this.client.srem(userSessionsKey(existing.userId), sessionId);
      await this.client.sadd(userSessionsKey(merged.userId), sessionId);
    }
  }

  async find(sessionId: string): Promise<SessionRecord | undefined> {
    const data = await this.client.get(sessionKey(sessionId));
    return deserializeSession(data);
  }

  async delete(sessionId: string): Promise<void> {
    const existing = await this.find(sessionId);
    await this.client.del(sessionKey(sessionId));
    if (existing) {
      await this.client.srem(userSessionsKey(existing.userId), sessionId);
    }
  }

  async findByUser(userId: string): Promise<SessionRecord[]> {
    const sessionIds = await this.client.smembers(userSessionsKey(userId));
    if (sessionIds.length === 0) {
      return [];
    }

    const pipeline = this.client.pipeline();
    sessionIds.forEach((id) => pipeline.get(sessionKey(id)));
    const results = await pipeline.exec();

    if (!results) {
      return [];
    }

    return results
      .map(([, value]) =>
        typeof value === "string" ? deserializeSession(value) : undefined,
      )
      .filter((session): session is SessionRecord => Boolean(session));
  }
}

let sharedRedisClient: Redis | null = null;

function getRedisClient(): Redis {
  if (!env.REDIS_URL) {
    throw new Error("REDIS_URL must be configured for Redis session store");
  }

  if (!sharedRedisClient) {
    sharedRedisClient = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    sharedRedisClient.on("error", (error) => {
      logger.error("Redis session store error", error as Error);
    });

    sharedRedisClient.on("connect", () => {
      logger.info("Connected to Redis session store");
    });

    void sharedRedisClient.connect().catch((error) => {
      logger.error("Failed to connect to Redis session store", error as Error);
    });
  }

  return sharedRedisClient;
}

export function createSessionStore(): SessionStore {
  if (env.SESSION_STORE_DRIVER === "redis") {
    logger.info("Using Redis session store", {
      environment: env.NODE_ENV,
      redisUrl: env.REDIS_URL?.replace(/:[^:@/]+@/, ":****@"),
    });
    return new RedisSessionStore(getRedisClient());
  }

  if (isProduction) {
    logger.warn(
      "Production environment detected without Redis session store configuration. Falling back to in-memory store.",
    );
  }

  return new InMemorySessionStore();
}
