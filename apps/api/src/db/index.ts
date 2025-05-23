import { DataSource } from "typeorm";
import { env } from "../shared/env";
import * as path from 'path';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: env.PGHOST,
    username: env.PGUSER,
    password: env.PGPASSWORD,
    database: env.PGDATABASE,
    port: 5432,
    entities: [path.join(__dirname, '../models/*.entity{.ts,.js}')],
    synchronize: true,
})