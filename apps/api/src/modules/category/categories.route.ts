import { z } from 'zod'
import { FastifyZodApp } from '../../types'
import { Category } from '../../db/models/category.entity.'
import { REPOSITORIES } from '../../shared/constant'
import { categorySchema } from './category.schema'

export async function categoriesRoutes(app: FastifyZodApp) {
    // Listagem
    app.get(
        '/',
        {
            schema: {
                tags: ['Categories'],
                description: 'Lista todas as categorias disponíveis para o usuário',
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
        '/',
        {
            schema: {
                tags: ['Categories'],
                description: 'Cria uma nova categoria',
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

            const category = await prisma.category.create({
                data: {
                    name,
                    color,
                    // userId,
                }
            })

            return category
        }
    )
    // Atualizar
    app.patch(
        '/',
        {
            schema: {
                tags: ['Categories'],
                description: 'Atualiza a cor de uma categoria existente',
                body: z.object({
                    categoryId: z.string().cuid(),
                }).merge(categorySchema.pick({ color: true })),
                response: {
                    200: categorySchema,
                    404: z.object({ message: z.string().default('Category not found') })
                },
                consumes: ['application/json'],
                produces: ['application/json'],
            }
        },
        async (request, reply) => {
            // const { userId } = await protectRoutes(request, reply)
            const { categoryId, color } = request.body

            const categoryExists = await prisma.category.findUnique({
                where: {
                    id: categoryId,
                    // userId
                }
            })

            if (!categoryExists) {
                return reply.status(404).send({ message: "Category not found" })
            }

            const updatedCategory = await prisma.category.update({
                where: {
                    id: categoryId,
                    // userId
                },
                data: {
                    color
                }
            })

            return updatedCategory
        }
    )
} 