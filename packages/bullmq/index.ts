import { Queue } from 'bullmq';
import { env } from '@topobre/env';
import IORedis from 'ioredis';

export const FINLOADER_QUEUE_NAME = 'finloader-file-processing';

export const redisConnection = new IORedis(env.UPSTASH_REDIS_URL, { maxRetriesPerRequest: null })

// Fila para o produtor (API) usar
export const finloaderQueue = new Queue(FINLOADER_QUEUE_NAME, {
  connection: redisConnection
});

export * from 'bullmq';