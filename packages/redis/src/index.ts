import Redis, { Callback, RedisKey } from 'ioredis';
import { env } from '@topobre/env';
import { logger } from '@topobre/winston';
import { getTracer, withSpan, addSpanAttributes, Traced } from '@topobre/telemetry';

logger.info('[REDIS] Redis config:', {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
});

export * from 'redis';

export class RedisClient extends Redis {
    constructor() {
        super({
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
            password: env.REDIS_PASSWORD,
            tls: {},
            maxRetriesPerRequest: 5,
            lazyConnect: true,
        });
    }

}

export const redis = new RedisClient();
