import { z } from 'zod'
import { FastifyZodApp, TransactionStatus } from '../../types'
import { createFinancialRecordSchema, financialRecordSchema } from './financial-record.schema'
import { REPOSITORIES } from '../../shared/constant'
import { notFoundErrorResponseSchema } from '../../shared/schemas'
import { finloaderQueue } from '@topobre/bullmq'
import { BankType } from '@topobre/finloader'

export async function financialRecordsRoutes(app: FastifyZodApp) {
    // Upload de arquivo
    app.post(
        '/upload',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['Financial Records'],
                description: 'Faz upload de um extrato bancário para processamento em fila',
                summary: 'Upload de extrato',
                response: {
                    202: z.object({
                        message: z.string()
                    }),
                    400: z.object({
                        error: z.string()
                    })
                }
            }
        },
        async (request, reply) => {
            const data = await request.file()
            if (!data) {
                return reply.status(400).send({ error: 'Nenhum arquivo enviado.' })
            }

            const fileContent = (await data.toBuffer()).toString('utf-8')
            const { userId } = request.user
            const bank = (data.fields.bank as any)?.value as BankType || BankType.DESCONHECIDO

            await finloaderQueue.add('process-file', {
                fileContent,
                userId,
                bank
            });

            reply.status(202).send({ message: 'Seu arquivo foi recebido e está sendo processado.' })
        }
    )

    // Listar transações
    app.get(
        '',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['Financial Records'],
                description: 'Lista todas as transações do usuário',
                summary: 'Lista todas as transações',
                response: {
                    200: z.array(financialRecordSchema)
                }
            }
        },
        async (request, reply) => {
            const { userId } = request.user

            const [financialRecords, total] = await app.db.getRepository(REPOSITORIES.FINANCIALRECORD).findAndCount({
                where: { user: { id: userId } },
                order: { dueDate: 'ASC' },
                relations: ['category'],
            })

            return reply.status(200).send(financialRecords)
        })
    // Criar transação
    app.post(
        '',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['Financial Records'],
                description: 'Cria uma nova transação',
                summary: 'Cria uma nova transação',
                body: createFinancialRecordSchema,
                response: {
                    201: financialRecordSchema,
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

            const financialRecord = await app.db.getRepository(REPOSITORIES.FINANCIALRECORD).save({
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

            return reply.status(201).send(financialRecord)
        }
    )
    // Atualizar transação
    app.patch(
        '',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['Financial Records'],
                description: 'Atualiza uma transação existente',
                summary: 'Atualiza uma transação',
                body: financialRecordSchema
                    .partial()
                    .refine((data) => data.id !== undefined, {
                        message: 'O campo "id" é obrigatório',
                        path: ['id'],
                    }),
                response: {
                    200: financialRecordSchema,
                    404: notFoundErrorResponseSchema
                }
            }
        },
        async (request, reply) => {
            const { id, ...data } = request.body

            const transactionExists = await app.db.getRepository(REPOSITORIES.FINANCIALRECORD).findOne({
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

            const updatedTransaction = await app.db.getRepository(REPOSITORIES.FINANCIALRECORD).update({
                id,
            }, {
                ...data,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            })

            return financialRecordSchema.parse(updatedTransaction)
        }
    )

    app.log.info('transaction routes registered')
}
