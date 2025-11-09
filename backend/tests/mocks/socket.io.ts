import { EventEmitter } from 'events';

export class MockSocket extends EventEmitter {
  id = 'mock-socket-id';
  emit(...args: any[]) { return true; }
  join(...args: any[]) { return this; }
  leave(...args: any[]) { return this; }
}

export class MockSocketServer extends EventEmitter {
  emit(...args: any[]) { return true; }
  to(...args: any[]) { return this; }
}

export function createMockSocketIO() {
  return new MockSocketServer();
}
