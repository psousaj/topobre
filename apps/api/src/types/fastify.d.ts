import type { FastifyReply, FastifyRequest } from "fastify";
import type { JWT } from "@fastify/jwt";
import type { DataSource } from "@topobre/typeorm";
import type { User } from "@topobre/typeorm/entities";
import type { DatabaseService, Mailer } from ".";

declare module "fastify" {
    interface FastifyRequest {
        user?: User;
        jwt?: JWT;
    }

    interface FastifyInstance {
        db: DatabaseService;
        mailer: Mailer;
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: {
            userId: string;
            email: string;
            jti: string;
            expiresAt?: number;
        };
        user: {
            userId: string;
            email: string;
            jti: string;
            expiresAt?: number;
        };
    }
}