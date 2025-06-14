import type { FastifyReply, FastifyRequest } from "fastify";
import type { JWT } from "@fastify/jwt";
import type { DataSource } from "@topobre/typeorm";
import type { User } from "@topobre/typeorm/entities";
import type { DatabaseService, Mailer } from ".";

declare module "fastify" {
    interface FastifyRequest {
        user?: Profile & {
            supabaseId: string;
            session?: SupabaseSession;
        };
        jwt?: JWT;
        supabase?: SupabaseClient;
    }

    interface FastifyInstance {
        db: DatabaseService;
        mailer: Mailer;
        supabase: SupabaseClient;
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: {
            userId: string; // ID do profile no seu banco
            supabaseId: string; // ID do usuário no Supabase
            email: string;
            jti: string;
            iat?: number;
            exp?: number;
        };
        user: {
            userId: string;
            supabaseId: string;
            email: string;
            jti: string;
            iat?: number;
            exp?: number;
        };
    }
}