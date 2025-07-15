import type { FastifyReply, FastifyRequest } from "fastify";
import type { JWT } from "@fastify/jwt";
import type { DataSource } from "@topobre/typeorm";
import type { Role, User } from "@topobre/typeorm";
import type { DatabaseService, Mailer } from ".";

declare module "fastify" {
    interface FastifyRequest {
        user?: {
            userId: string;
            email: string;
            jti: string;
            expiresAt?: number;
            roles: Role[];
        };
    }

    interface FastifyInstance {
        db: DatabaseService;
        mailer: Mailer;

        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

        hasRole: (roles: string | string[]) => (
            request: FastifyRequest,
            reply: FastifyReply
        ) => Promise<void>;

        isOwner: (paramName?: string) => (
            request: FastifyRequest,
            reply: FastifyReply
        ) => Promise<void>;
    }
}

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: {
            userId: string;
            email: string;
            jti: string;
            expiresAt?: number;
            roles: Role[];
        };
        user: {
            userId: string;
            email: string;
            jti: string;
            expiresAt?: number;
            roles: Role[];
        };
    }
}