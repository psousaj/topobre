import { FastifyInstance, FastifyBaseLogger } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { Server, IncomingMessage, ServerResponse } from "http";

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


export {
    FastifyZodApp,
    TransactionStatus,
    TransactionType,
}