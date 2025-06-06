// types/fastify.d.ts
import "fastify";
import { DataSource } from "typeorm";
import { User } from "../db/entities/user.entity";
import { DatabaseService, Mailer } from '../types'
import { JWT } from '@fastify/jwt';

declare module "fastify" {
    interface FastifyRequest {
        user?: User;
        jwt?: JWT
    }

    interface FastifyInstance {
        db: DatabaseService;
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
        mailer: Mailer;
    }
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: {
            userId: string;
            email: string;
            jti: string;
            iat?: number;
            exp?: number;
        };
        user: {
            userId: string;
            email: string;
            jti: string;
            iat?: number;
            exp?: number;
        };
    }
}