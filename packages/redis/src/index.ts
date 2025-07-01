import Redis from 'ioredis';
import { env } from '@topobre/env';
import { logger } from '@topobre/winston';
import { getTracer, withSpan, addSpanAttributes } from '@topobre/telemetry';

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

    override get(key: string): Promise<string | null> {
        return Promise.resolve(
            withSpan('redis.get', async (span) => {
                addSpanAttributes({ 'redis.key': key });
                return super.get(key);
            }),
        );
    }

    override set(...args: Parameters<Redis['set']>): Promise<string | null> {
        return Promise.resolve(
            withSpan('redis.set', async (span) => {
                addSpanAttributes({ 'redis.key': String(args[0]) });
                return super.set.apply(this, args);
            }),
        );
    }

    override del(...args: Parameters<Redis['del']>): Promise<number> {
        return Promise.resolve(
            withSpan('redis.del', async (span) => {
                addSpanAttributes({ 'redis.keys': args.join(',') });
                return super.del.apply(this, args);
            }),
        );
    }

    override hgetall(key: string): Promise<Record<string, string>> {
        return Promise.resolve(
            withSpan('redis.hgetall', async (span) => {
                addSpanAttributes({ 'redis.key': key });
                return super.hgetall(key);
            }),
        );
    }

    override lpush(key: string, ...elements: string[]): Promise<number> {
        return Promise.resolve(
            withSpan('redis.lpush', async (span) => {
                addSpanAttributes({ 'redis.key': key, 'redis.elements.count': elements.length });
                return super.lpush(key, ...elements);
            }),
        );
    }

    override rpop(key: string): Promise<string | null> {
        return Promise.resolve(
            withSpan('redis.rpop', async (span) => {
                addSpanAttributes({ 'redis.key': key });
                return super.rpop(key);
            }),
        );
    }

    override publish(channel: string, message: string): Promise<number> {
        return Promise.resolve(
            withSpan('redis.publish', async (span) => {
                addSpanAttributes({ 'redis.channel': channel, 'redis.message.length': message.length });
                return super.publish(channel, message);
            }),
        );
    }

    override subscribe(...channels: string[]): Promise<number> {
        return Promise.resolve(
            withSpan('redis.subscribe', async (span) => {
                addSpanAttributes({ 'redis.channels.count': channels.length });
                return super.subscribe.apply(this, channels);
            }),
        );
    }
}

export const redis = new RedisClient();
