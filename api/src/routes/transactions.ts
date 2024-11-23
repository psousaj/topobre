import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { protectRoutes } from '../lib/clerk'
import { clerkPreHandler } from '../auth/clerkHandler'

const transactionSchema = z.object({
    transactionId: z.string().uuid().optional(), // Transaction ID
    transactionValue: z.number().positive('Valor deve ser positivo'),
    dueDate: z.string().refine(date => new Date(date) < new Date(), {
        message: 'Vencimento deve ser uma data futura',
    }),
    description: z.string().min(3, 'Descrição deve ter ao menos 3 caracteres'),
    transactionType: z.enum(['payment', 'receipt'], {
        errorMap: () => ({ message: 'Tipo deve ser payment ou receipt' })
    }),
    categoryId: z.string(),
    userId: z.string().uuid().optional(),
});

export async function transactionsRoutes(app: FastifyInstance) {
    // Listar transações
    app.withTypeProvider<ZodTypeProvider>().get(
        '/',
        // { preHandler: clerkPreHandler },
        async (request, reply) => {
            const { userId } = await protectRoutes(request, reply)

            const transactions = await prisma.transaction.findMany({
                where: {
                    userId,
                },
                include: {
                    category: true,
                },
            })

            return transactions
        })
    // Criar transação
    app.withTypeProvider<ZodTypeProvider>().post(
        '/',
        {
            schema: {
                body: transactionSchema
            }
        },
        async (request, reply) => {
            const { userId } = await protectRoutes(request, reply)
            const { categoryId, description, dueDate, transactionType, transactionValue } = request.body

            const categoryExists = await prisma.category.findUnique({
                where: { id: categoryId }
            })

            if (!categoryExists) {
                return reply.status(404).send({
                    message: 'Category not found'
                })
            }

            const transaction = await prisma.transaction.create({
                data: {
                    description,
                    dueDate: new Date(dueDate),
                    transactionType,
                    userId,
                    transactionValue,
                    category: { connect: { id: categoryId } }
                }
            })

            return reply.status(201).send(transaction)
        }
    )
    // Atualizar transação
    app.withTypeProvider<ZodTypeProvider>().patch(
        '/',
        {
            schema: {
                body: transactionSchema.partial()
            }
        },
        async (request, reply) => {
            const { userId } = await protectRoutes(request, reply)
            const data = request.body

            const updatedTransaction = await prisma.transaction.update({
                where: {
                    id: data.transactionId
                },
                data
            })

            return updatedTransaction
        }
    )
}