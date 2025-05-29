import "reflect-metadata";

import { DataSource } from "typeorm";
import { env } from "../shared/env";
import * as path from "path";

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: env.PGHOST,
    username: env.PGUSER,
    password: env.PGPASSWORD,
    database: env.PGDATABASE,
    port: 5432,

    entities: [
        path.resolve(__dirname, '../db/entities/*.entity.{js,ts}'),
    ],
    synchronize: true,
    // logging: true,
    ssl: true,
    cache: false, // Desabilita cache para desenvolvimento
    dropSchema: false, // Não derruba o schema ao reiniciar a aplicação
    migrationsRun: false,

    extra: {
        // Configurações específicas do driver postgres
        max: 10,
        idleTimeoutMillis: 30000,
    }
});