import { z } from 'zod'
import { FastifyZodApp } from '../../types'
import { Category } from '../../db/entities/category.entity'
import { REPOSITORIES } from '../../shared/constant'
import { categoryResponseSchema, categorySchema } from './category.schema'
import { notFoundErrorResponseSchema } from '../../shared/schemas'

export async function categoriesRoutes(app: FastifyZodApp) {
    // Listagem
    app.get(
        '',
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['Categories'],
                description: 'Lista todas as categorias disponíveis para o usuário',
                summary: 'Lista todas as categorias',
                produces: ['application/json'],
                response: {
                    200: z.array(categoryResponseSchema)
                }
            }
        },
        async (request, reply) => {
            const categoryRepo = app.db.getRepository<Category>(REPOSITORIES.CATEGORY)
            const { userId } = request.user
            console.log(userId)
            const categories = await categoryRepo
                .createQueryBuilder("item")
                .where("item.userId = :userId", { userId: userId })
                .orWhere("item.isDefault = :isDefault", { isDefault: true })
                .getMany();

            return reply.status(200).send(categories)
        })
    //  Criar
    app.post(
        '',
        {
            preHandler: app.authenticate,
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
            preHandler: app.authenticate,
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