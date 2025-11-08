import { logger } from './logger';

type AuditTask = () => Promise<void> | void;

class AuditQueue {
  private queue: AuditTask[] = [];
  private isProcessing = false;

  enqueue(task: AuditTask): void {
    this.queue.push(task);
    void this.process();
  }

  private async process(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) {
        continue;
      }

      try {
        await task();
      } catch (error) {
        logger.error('Audit task failed', error as Error);
      }
    }

    this.isProcessing = false;
  }
}

export const auditQueue = new AuditQueue();
