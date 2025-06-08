import { FastifyInstance, FastifyBaseLogger } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { Server, IncomingMessage, ServerResponse } from "http";
import { DataSource, EntityTarget, ObjectLiteral, Repository, TransactionStatus, TransactionType } from "@topobre/typeorm";
import { REPOSITORIES } from "../shared/constant";


type FastifyZodApp = FastifyInstance<Server<typeof IncomingMessage, typeof ServerResponse>, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, ZodTypeProvider>


type TemplateParams = Record<string, any>;

interface SendEmailOptions {
    to: string;
    subject: string;
    templateName: string;
    params: TemplateParams;
}

interface Mailer {
    sendPasswordResetEmail(to: string, resetLink: string): Promise<void>;
}


// Tipo para as chaves dos repositórios
type RepositoryKey = keyof typeof REPOSITORIES;

// Tipo para os repositórios
type RepositoryType<K extends RepositoryKey> = typeof REPOSITORIES[K];

interface DatabaseService {
    dataSource: DataSource;
    getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T>;
    isConnected(): boolean;
    transaction<T extends ObjectLiteral>(fn: (manager: any) => Promise<T>): Promise<T>;
}

export {
    FastifyZodApp,
    TransactionStatus,
    TransactionType,
    RepositoryKey,
    RepositoryType,
    DatabaseService,
    Mailer,
    SendEmailOptions,
    TemplateParams
}