// types/fastify.d.ts
import "fastify";
import { DataSource } from "typeorm";

declare module "fastify" {
    interface FastifyInstance {
        db: DataSource;
    }
}
