// types/fastify.d.ts
import "fastify";
import { DataSource } from "typeorm";
import { User } from "../db/entities/user.entity";

declare module "fastify" {
    interface FastifyInstance {
        db: DataSource;
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }

    interface FastifyRequest {
        jwt: JWT
    }
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: { userId: string; email: string, jti: string };
        user: User
    }
}
