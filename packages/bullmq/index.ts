import { Queue } from 'bullmq';
import { env } from '@topobre/env';
import Redis from 'ioredis';

export const FINLOADER_QUEUE_NAME = 'finloader-file-processing';

export const redisConnection = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  tls: {},
})

export const finloaderQueue = new Queue(FINLOADER_QUEUE_NAME, {
  connection: redisConnection
});

export * from 'bullmq';