import { Queue } from 'bullmq';
import { env } from '@topobre/env';

export const FINLOADER_QUEUE_NAME = 'finloader-file-processing';

// Opções de conexão com o Redis
export const redisConnection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
};

// Fila para o produtor (API) usar
export const finloaderQueue = new Queue(FINLOADER_QUEUE_NAME, { connection: redisConnection });
