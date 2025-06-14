import "reflect-metadata";

import { DataSource } from "typeorm";
import * as path from "path";
import { env } from "@topobre/env";

export * from 'typeorm';

export * from './entities';

export * from './types';

console.log('Redis config:', {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
})


export const TopobreDataSource = new DataSource({
    type: 'postgres',
    host: env.PGHOST,
    username: env.PGUSER,
    password: env.PGPASSWORD,
    database: env.PGDATABASE,
    port: 5432,

    entities: [
        path.resolve(__dirname, './entities/*.entity.{js,ts}'),
    ],
    synchronize: true,
    // logging: true,
    ssl: false,
    cache: {
        type: "ioredis",
        alwaysEnabled: true,
        options: {
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
            password: env.REDIS_PASSWORD,
        },
        duration: 60000 * 1 // 5 minutos
    },
    dropSchema: false, // Não derruba o schema ao reiniciar a aplicação
    migrationsRun: false,

    extra: {
        // Configurações específicas do driver postgres
        max: 10,
        idleTimeoutMillis: 30000,
    }
});