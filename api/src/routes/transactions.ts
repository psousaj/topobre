import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { clerkClient } from '@clerk/fastify'

export async function transactionsRoutes(app: FastifyInstance) {
    app.addHook('preHandler', async (request) => {
        if (!request.auth.userId) {
            throw new Error('Unauthorized')
        }
    })

    app.get('/', async (request) => {
        const transactions = await prisma.transaction.findMany({
            where: {
                userId: request.auth.userId,
            },
            include: {
                categoria: true,
            },
        })

        return transactions
    })

    app.post('/', async (request) => {
        const createTransactionSchema = z.object({
            valor: z.number(),
            dataVencimento: z.string(),
            descricao: z.string(),
            categoria: z.string(),
            repeteMensalmente: z.boolean(),
            tipo: z.enum(['payment', 'receipt']),
        })

        const data = createTransactionSchema.parse(request.body)

        const transaction = await prisma.transaction.create({
            data: {
                ...data,
                userId: request.auth.userId,
                categoryId: data.categoria,
            },
        })

        return transaction
    })
} 