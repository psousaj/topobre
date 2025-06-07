import { z } from 'zod'
import { FastifyZodApp, TransactionStatus } from '../../types'
import { createTransactionSchema, transactionSchema } from './transaction.schema'
import { REPOSITORIES } from '../../shared/constant'
import { notFoundErrorResponseSchema } from '../../shared/schemas'

export async function transactionsRoutes(app: FastifyZodApp) {
    // Listar transações
    app.get(
        '',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['Transactions'],
                description: 'Lista todas as transações do usuário',
                summary: 'Lista todas as transações',
                response: {
                    200: z.array(transactionSchema)
                }
            }
        },
        async (request, reply) => {
            const { userId } = request.user

            const [transactions, total] = await app.db.getRepository(REPOSITORIES.TRANSACTION).findAndCount({
                where: { user: { id: userId } },
                order: { dueDate: 'ASC' },
                relations: ['category'],
            })

            return reply.status(200).send(transactions)
        })
    // Criar transação
    app.post(
        '',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['Transactions'],
                description: 'Cria uma nova transação',
                summary: 'Cria uma nova transação',
                body: createTransactionSchema,
                response: {
                    201: transactionSchema,
                    404: notFoundErrorResponseSchema
                }
            }
        },
        async (request, reply) => {
            const { categoryId, description, dueDate, type, valueInCents } = request.body

            const categoryExists = await app.db.getRepository(REPOSITORIES.CATEGORY).findOne({
                where: { id: categoryId }
            })

            if (!categoryExists) {
                return reply.status(404).send({
                    message: 'Category not found'
                })
            }

            const transaction = await app.db.getRepository(REPOSITORIES.TRANSACTION).save({
                description,
                dueDate: new Date(dueDate),
                type,
                valueInCents,
                category: categoryExists,
                user: {
                    id: request.user.userId
                },
                status: TransactionStatus.PENDING
            })

            return reply.status(201).send(transaction)
        }
    )
    // Atualizar transação
    app.patch(
        '',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['Transactions'],
                description: 'Atualiza uma transação existente',
                summary: 'Atualiza uma transação',
                body: transactionSchema
                    .partial()
                    .refine((data) => data.id !== undefined, {
                        message: 'O campo "id" é obrigatório',
                        path: ['id'],
                    }),
                response: {
                    200: transactionSchema,
                    404: notFoundErrorResponseSchema
                }
            }
        },
        async (request, reply) => {
            const { id, ...data } = request.body

            const transactionExists = await app.db.getRepository(REPOSITORIES.TRANSACTION).findOne({
                where: {
                    id,
                    user: request.user
                }
            })

            if (!transactionExists) {
                return reply.status(404).send({
                    message: 'Transaction not found'
                })
            }

            const updatedTransaction = await app.db.getRepository(REPOSITORIES.TRANSACTION).update({
                id,
            }, {
                ...data,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            })

            return transactionSchema.parse(updatedTransaction)
        }
    )

    app.log.info('transaction routes registered')
}