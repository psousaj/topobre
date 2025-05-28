import { z } from 'zod'
import { FastifyZodApp } from '../../types'
import { Category } from '../../db/entities/category.entity'
import { REPOSITORIES } from '../../shared/constant'
import { categorySchema } from './category.schema'
import { notFoundErrorResponseSchema } from '../../shared/schemas'

export async function categoriesRoutes(app: FastifyZodApp) {
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
                    200: z.array(categorySchema)
                }
            }
        },
        async (request, reply) => {
            const categoryRepo = app.db.getRepository<Category>(REPOSITORIES.CATEGORY)

            const categories = await categoryRepo
                .createQueryBuilder("item")
                // .where("item.userId = :userId", { userId })
                .orWhere("item.isDefault = :isDefault", { isDefault: true })
                .getMany();


            return categories
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
                    200: categorySchema,
                },
                consumes: ['application/json'],
                produces: ['application/json'],
            }
        },
        async (request, reply) => {
            const { name, color } = request.body

            const category = await app.db.getRepository(REPOSITORIES.CATEGORY).save({
                name,
                color,
                userId: request.user.id,
            })

            return reply.status(201).send(
                categorySchema.parse(category)
            )
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
            const { id: userId } = request.user
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
} 