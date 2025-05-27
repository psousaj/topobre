import { DataSource } from "typeorm";
import { env } from "../shared/env";
import * as path from 'path';
import { FastifyInstance } from 'fastify';
import { Transaction } from "./entities/transaction.entity";
import { Session } from "inspector";
import { Category } from "./entities/category.entity.";
import { User } from "./entities/user.entity";

// export async function connectToDatabase(app: FastifyInstance) {
//     app.register(dbConnection, {
//         type: 'postgres',
//         host: env.PGHOST,
//         username: env.PGUSER,
//         password: env.PGPASSWORD,
//         database: env.PGDATABASE,
//         port: 5432,
//         entities: [path.join(__dirname, '../entities/*.entity{.ts,.js}')],
//         synchronize: true,
//     })
// }

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: env.PGHOST,
    username: env.PGUSER,
    password: env.PGPASSWORD,
    database: env.PGDATABASE,
    port: 5432,
    // entities: [path.resolve(__dirname, '../entities/**/*.entity.{ts,js}')],
    entities: [
        Transaction,
        User,
        Category,
        Session
    ],
    synchronize: true,
})