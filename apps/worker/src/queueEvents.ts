import { logger } from '@topobre/winston';
import { FINLOADER_QUEUE_NAME, redisConnection, QueueEvents } from '@topobre/bullmq';

const queueEvents = new QueueEvents(FINLOADER_QUEUE_NAME, { connection: redisConnection });
queueEvents.on('waiting', ({ jobId }) => logger.info(`[CSV-WORKER] Job ${jobId} is waiting`));
queueEvents.on('active', ({ jobId }) => logger.info(`[CSV-WORKER] Job ${jobId} is active`));
queueEvents.on('completed', ({ jobId }) => logger.info(`[CSV-WORKER] Job ${jobId} completed`));
queueEvents.on('failed', ({ jobId, failedReason }) => logger.error(`[CSV-WORKER] Job ${jobId} failed: ${failedReason}`));