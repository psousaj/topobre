"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionsRoutes = transactionsRoutes;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const clerk_1 = require("../lib/clerk");
const transactionSchema = zod_1.z.object({
    transactionId: zod_1.z.string().uuid().optional(), // Transaction ID
    transactionValue: zod_1.z.number().positive('Valor deve ser positivo'),
    dueDate: zod_1.z.string().refine(date => new Date(date) < new Date(), {
        message: 'Vencimento deve ser uma data futura',
    }),
    description: zod_1.z.string().min(3, 'Descrição deve ter ao menos 3 caracteres'),
    transactionType: zod_1.z.enum(['payment', 'receipt'], {
        errorMap: () => ({ message: 'Tipo deve ser payment ou receipt' })
    }),
    categoryId: zod_1.z.string(),
    userId: zod_1.z.string().uuid().optional(),
});
async function transactionsRoutes(app) {
    // Listar transações
    app.withTypeProvider().get('/', 
    // { preHandler: clerkPreHandler },
    async (request, reply) => {
        const { userId } = await (0, clerk_1.protectRoutes)(request, reply);
        const transactions = await prisma_1.prisma.transaction.findMany({
            where: {
                userId,
            },
            include: {
                category: true,
            },
        });
        return transactions;
    });
    // Criar transação
    app.withTypeProvider().post('/', {
        schema: {
            body: transactionSchema
        }
    }, async (request, reply) => {
        const { userId } = await (0, clerk_1.protectRoutes)(request, reply);
        const { categoryId, description, dueDate, transactionType, transactionValue } = request.body;
        const categoryExists = await prisma_1.prisma.category.findUnique({
            where: { id: categoryId }
        });
        if (!categoryExists) {
            return reply.status(404).send({
                message: 'Category not found'
            });
        }
        const transaction = await prisma_1.prisma.transaction.create({
            data: {
                description,
                dueDate: new Date(dueDate),
                transactionType,
                userId,
                transactionValue,
                category: { connect: { id: categoryId } }
            }
        });
        return reply.status(201).send(transaction);
    });
    // Atualizar transação
    app.withTypeProvider().patch('/', {
        schema: {
            body: transactionSchema.partial()
        }
    }, async (request, reply) => {
        const { userId } = await (0, clerk_1.protectRoutes)(request, reply);
        const data = request.body;
        const updatedTransaction = await prisma_1.prisma.transaction.update({
            where: {
                id: data.transactionId
            },
            data
        });
        return updatedTransaction;
    });
}
