import { FastifyInstance, FastifyBaseLogger } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { Server, IncomingMessage, ServerResponse } from "http";
import { DataSource, EntityTarget, Repository } from "typeorm";
import { REPOSITORIES } from "../shared/constant";


type FastifyZodApp = FastifyInstance<Server<typeof IncomingMessage, typeof ServerResponse>, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, ZodTypeProvider>

enum TransactionStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    LATE = 'late',
    FAILED = 'failed',
}

enum TransactionType {
    INCOME = 'income',
    EXPENSE = 'expense',
    TRANSFER = 'transfer',
    PAYMENT = 'payment',
    RECEIPT = 'receipt',
}

// Tipo para as chaves dos repositórios
type RepositoryKey = keyof typeof REPOSITORIES;

// Tipo para os repositórios
type RepositoryType<K extends RepositoryKey> = typeof REPOSITORIES[K];

interface DatabaseService {
    dataSource: DataSource;
    getRepository<T>(entity: EntityTarget<T>): Repository<T>;
    isConnected(): boolean;
    transaction<T>(fn: (manager: any) => Promise<T>): Promise<T>;
}

export {
    FastifyZodApp,
    TransactionStatus,
    TransactionType,
    RepositoryKey,
    RepositoryType,
    DatabaseService
}