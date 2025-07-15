import { z } from 'zod'
import { FastifyZodApp } from '../../types'
import { REPOSITORIES } from '../../shared/constant'
import { categoryResponseSchema, categorySchema } from './category.schema'
import { notFoundErrorResponseSchema } from '../../shared/schemas'
import { Category } from '@topobre/typeorm'
import { saveCategories } from '@topobre/typeorm'

export async function categoriesRoutes(app: FastifyZodApp) {
    app.get('/seed',
        {
            preHandler: [app.hasRole('admin')],
            schema: {
                tags: ['Categories'],
                description: 'Roda o script de seed para categorias padrões',
                summary: 'Roda o script de seed para categorias padrões',
                response: {
                    200: z.object({
                        message: z.string(),
                    }),
                },
            }
        },
        async (req, rep) => {
            await saveCategories(app.db)
        }
    )

    // Listagem
    app.get(
        '',
        {
            schema: {
                tags: ['Categories'],
                description: 'Lista todas as categorias disponíveis para o usuário',
                summary: 'Lista todas as categorias',
                produces: ['application/json'],
                response: {
                    // 200: z.array(categoryResponseSchema)
                }
            }
        },
        async (request, reply) => {
            const categoryRepo = app.db.getRepository<Category>(REPOSITORIES.CATEGORY)
            const { userId } = request.user
            const [categories, total] = await categoryRepo
                .createQueryBuilder("item")
                .where("item.userId = :userId", { userId: userId })
                .orWhere("item.isDefault = :isDefault", { isDefault: true })
                .select(["item.name", "item.displayName", "item.color", "item.isDefault", "item.id"])
                .getManyAndCount()
            // .addSelect("item.id", "categoryId")
            // .getRawMany();

            return reply.status(200).send(categories)
        })
    //  Criar
    app.post(
        '',
        {
            schema: {
                tags: ['Categories'],
                description: 'Cria uma nova categoria',
                summary: 'Cria uma nova categoria',
                body: categorySchema,
                response: {
                    200: categoryResponseSchema,
                },
                consumes: ['application/json'],
                produces: ['application/json'],
            }
        },
        async (request, reply) => {
            const { name, color } = request.body

            const category = await app.db.getRepository(REPOSITORIES.CATEGORY).save({
                name,
                displayName: name,
                color,
                userId: request.user.userId,
            })

            return reply.status(201).send(category)
        }
    )
    // Atualizar
    app.patch(
        '',
        {
            schema: {
                tags: ['Categories'],
                description: 'Atualiza a cor de uma categoria existente',
                summary: 'Atualiza a cor de uma categoria',
                body: z.object({
                    categoryId: z.string().cuid(),
                }).merge(categorySchema.pick({ color: true })),
                response: {
                    200: categorySchema,
                    404: notFoundErrorResponseSchema
                },
                consumes: ['application/json'],
                produces: ['application/json'],
            }
        },
        async (request, reply) => {
            const { userId } = request.user
            const { categoryId, color } = request.body

            const categoryExists = await app.db.getRepository(REPOSITORIES.CATEGORY).findOne({
                where: {
                    id: categoryId,
                    userId
                }
            })

            if (!categoryExists) {
                return reply.status(404).send({ message: "Category not found" })
            }

            const updatedCategory = await app.db.getRepository(REPOSITORIES.CATEGORY).update(
                { id: categoryId, },
                { color }
            )

            return reply.status(200).send(
                categorySchema.parse({
                    ...categoryExists,
                    color
                })
            )
        }
    )

    app.log.info('categories routes registered')
} 