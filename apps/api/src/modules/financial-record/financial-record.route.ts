import { z } from 'zod'
import { FastifyZodApp, TransactionStatus } from '../../types'
import { createFinancialRecordSchema, financialRecordSchema } from './financial-record.schema'
import { REPOSITORIES } from '../../shared/constant'
import { notFoundErrorResponseSchema } from '../../shared/schemas'
import { finloaderQueue } from '@topobre/bullmq'
import { BankType } from '@topobre/finloader'
import { isOwner } from '../../plugins/authorization'
import { addSpanAttributes, addSpanEvent, createCounter, createHistogram, withSpan } from '@topobre/telemetry'

const fileUploadsCounter = createCounter(
    'financial_file_uploads_total',
    'Total de uploads de arquivos financeiros',
    '1'
);

const transactionOperationsCounter = createCounter(
    'financial_transactions_operations_total',
    'Total de operações em transações financeiras',
    '1'
);

const fileProcessingDuration = createHistogram(
    'financial_file_processing_duration_seconds',
    'Duração do processamento de arquivos financeiros',
    's'
);

const databaseOperationDuration = createHistogram(
    'financial_database_operation_duration_seconds',
    'Duração das operações de banco de dados financeiras',
    's'
);

export async function financialRecordsRoutes(app: FastifyZodApp) {
    // Upload de arquivo
    app.post(
        '/upload',
        {
            preHandler: app.auth([isOwner('userId')]),
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
            const startTime = Date.now();

            return withSpan('financial-file-upload', async (span) => {
                try {
                    const { userId } = request.user;

                    // Adicionar informações do usuário ao span
                    span.setAttributes({
                        'user.id': userId,
                        'operation': 'file-upload',
                        'service': 'financial-records'
                    });

                    const data = await request.file();

                    if (!data) {
                        addSpanEvent('file-upload-error', {
                            'error.type': 'no-file-provided'
                        });

                        fileUploadsCounter.add(1, {
                            status: 'error',
                            error_type: 'no_file'
                        });

                        return reply.status(400).send({ error: 'Nenhum arquivo enviado.' });
                    }

                    // Processar arquivo
                    const fileContent = (await data.toBuffer()).toString('utf-8');
                    const bank = (data.fields.bank as any)?.value as BankType || BankType.DESCONHECIDO;

                    // Adicionar informações do arquivo
                    addSpanAttributes({
                        'file.bank': bank,
                        'file.size': fileContent.length,
                        'file.name': data.filename || 'unknown'
                    });

                    addSpanEvent('file-processed', {
                        'file.bank': bank,
                        'file.size': fileContent.length
                    });

                    // Adicionar à fila
                    await withSpan('queue-job-add', async (queueSpan) => {
                        queueSpan.setAttributes({
                            'queue.name': 'finloader',
                            'job.type': 'process-file',
                            'user.id': userId
                        });

                        await finloaderQueue.add('process-file', {
                            fileContent,
                            userId,
                            bank
                        });

                        addSpanEvent('job-queued', {
                            'queue.name': 'finloader',
                            'job.type': 'process-file'
                        });
                    });

                    // Métricas de sucesso
                    fileUploadsCounter.add(1, {
                        status: 'success',
                        bank: bank
                    });

                    const duration = (Date.now() - startTime) / 1000;
                    fileProcessingDuration.record(duration, {
                        operation: 'upload',
                        bank: bank
                    });

                    return reply.status(202).send({
                        message: 'Seu arquivo foi recebido e está sendo processado.'
                    });

                } catch (error: any) {
                    addSpanEvent('file-upload-error', {
                        'error.message': error.message,
                        'error.type': 'processing_error'
                    });

                    fileUploadsCounter.add(1, {
                        status: 'error',
                        error_type: 'processing'
                    });

                    throw error;
                }
            });
        }
    )

    // Listar transações
    app.get(
        '',
        {
            preHandler: app.auth([isOwner('userId')]),
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
            preHandler: app.auth([isOwner('userId')]),
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
            preHandler: app.auth([isOwner('userId')]),
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
                    user: { id: request.user.userId }
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
