import { Queue, Worker, QueueScheduler, Job } from 'bullmq';
import { env } from '@topobre/env';

export const connection = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
};

export function createQueue(name: string) {
    return new Queue(name, { connection });
}

export function createWorker<T = any>(name: string, processor: (job: Job<T>) => Promise<any>) {
    return new Worker<T>(name, processor, { connection });
}

export function createQueueScheduler(name: string) {
    return new QueueScheduler(name, { connection });
}
