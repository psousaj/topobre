// src/debug/debug-ioredis.ts
import Redis, { RedisOptions } from 'ioredis';
import fs from 'fs';
import path from 'path';

const logFilePath = path.resolve(__dirname, 'redis-connections.log');

const OriginalRedis = Redis;

class DebugRedis extends OriginalRedis {
    constructor(options?: RedisOptions | string) {
        const rawStack = new Error().stack?.split('\n').slice(2) || [];

        // Filtra e formata o stack trace para deixar legível
        const cleanedStack = rawStack
            .filter((line) => !line.includes('node_modules')) // Remove ruído
            .map((line) => line.trim());

        const logEntry = {
            timestamp: new Date().toISOString(),
            config: typeof options === 'string' ? options : options ?? {},
            trace: cleanedStack,
        };

        const formattedLog = JSON.stringify(logEntry, null, 2);

        // Loga no console (opcional)
        console.log(`\n🔴 [ioredis] Nova conexão Redis:\n${formattedLog}\n`);

        // Salva no arquivo
        fs.appendFileSync(logFilePath, formattedLog + ',\n');

        super(options as any);
    }
}

// Monkey patch
// @ts-ignore
require.cache[require.resolve('ioredis')].exports = DebugRedis;
