import Redis from 'ioredis';
import { env } from '@topobre/env';
import { logger } from '@topobre/winston';
import { getTracer, traced } from '@topobre/telemetry';

const tracer = getTracer('redis-package', '0.0.0'); // Versão 0.0.0 do pacote redis

logger.info('[REDIS] Redis config:', {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
});

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

    @traced(tracer, 'redis.get')
    async get(key: string): Promise<string | null> {
        return super.get(key);
    }

    @traced(tracer, 'redis.set')
    async set(key: string, value: string, expiryMode?: string, time?: number): Promise<string | null> {
        return super.set(key, value, expiryMode, time);
    }

    @traced(tracer, 'redis.del')
    async del(...keys: string[]): Promise<number> {
        return super.del(...keys);
    }

    @traced(tracer, 'redis.hgetall')
    async hgetall(key: string): Promise<Record<string, string>> {
        return super.hgetall(key);
    }

    @traced(tracer, 'redis.lpush')
    async lpush(key: string, ...elements: string[]): Promise<number> {
        return super.lpush(key, ...elements);
    }

    @traced(tracer, 'redis.rpop')
    async rpop(key: string): Promise<string | null> {
        return super.rpop(key);
    }

    @traced(tracer, 'redis.publish')
    async publish(channel: string, message: string): Promise<number> {
        return super.publish(channel, message);
    }

    @traced(tracer, 'redis.subscribe')
    async subscribe(...channels: string[]): Promise<number> {
        return super.subscribe(...channels);
    }
}

export const redis = new RedisClient();
