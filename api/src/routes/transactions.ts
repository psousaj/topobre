import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { string, z } from 'zod'
import { prisma } from '../lib/prisma'
import { protectRoutes } from '../lib/clerk'
import { clerkPreHandler } from '../auth/clerkHandler'
import { categorySchema } from './categories'

enum paymentType {
    PAYMENT = 'payment',
    RECEIPT = 'receipt'
}

const transactionSchema = z.object({
    id: z.string().cuid(), // Transaction ID
    transactionValue: z.number().positive('Valor deve ser positivo'),
    dueDate: z.string().refine(date => new Date(date) < new Date(), {
        message: 'Vencimento deve ser uma data futura',
    }).or(z.date()),
    description: z.string().min(3, 'Descrição deve ter ao menos 3 caracteres'),
    transactionType: z.nativeEnum(paymentType, {
        errorMap: () => ({ message: 'Tipo deve ser payment ou receipt' }),
    }),
    userId: z.string().uuid().optional(),
    categoryId: z.string(),
    category: categorySchema.optional(),
})

export async function transactionsRoutes(app: FastifyInstance) {
    // Listar transações
    app.withTypeProvider<ZodTypeProvider>().get(
        '/',
        {
            preHandler: clerkPreHandler,
            schema: {
                tags: ['Transactions'],
                description: 'Lista todas as transações do usuário',
                response: {
                    200: z.array(transactionSchema)
                }
            }
        },
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

            return reply.status(200).send(
                z.array(transactionSchema).parse(transactions)
            )
        })
    // Criar transação
    app.withTypeProvider<ZodTypeProvider>().post(
        '/',
        {
            schema: {
                tags: ['Transactions'],
                description: 'Cria uma nova transação',
                body: transactionSchema.omit({ id: true, userId: true }),
                response: {
                    201: transactionSchema,
                    404: z.object({ message: z.string().default('Category not found') })
                }
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

            return reply.status(201).send(
                transactionSchema.parse(transaction)
            )
        }
    )
    // Atualizar transação
    app.withTypeProvider<ZodTypeProvider>().patch(
        '/',
        {
            schema: {
                tags: ['Transactions'],
                description: 'Atualiza uma transação existente',
                body: transactionSchema
                    .omit({ category: true })
                    .partial()
                    .refine((data) => data.id !== undefined, {
                        message: 'O campo "id" é obrigatório',
                        path: ['id'],
                    }),
                response: {
                    200: transactionSchema,
                    404: z.object({ message: z.string().default('Transaction not found') })
                }
            }
        },
        async (request, reply) => {
            const { userId } = await protectRoutes(request, reply)
            const data = request.body

            const transactionExists = await prisma.transaction.findUnique({
                where: { id: data.id, userId }
            })

            if (!transactionExists) {
                return reply.status(404).send({
                    message: 'Transaction not found'
                })
            }

            const updatedTransaction = await prisma.transaction.update({
                where: {
                    id: data.id,
                    userId
                },
                data
            })

            return transactionSchema.parse(updatedTransaction)
        }
    )
}