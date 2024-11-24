import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { protectRoutes } from '../lib/clerk'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

export const categorySchema = z.object({
    name: z.string().min(4),
    color: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Deve ser uma cor HEX válida"),
    isDefault: z.boolean().optional()
})

export async function categoriesRoutes(app: FastifyInstance) {
    // Listagem
    app.withTypeProvider<ZodTypeProvider>().get(
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
            const { userId } = await protectRoutes(request, reply)

            const categories = await prisma.category.findMany({
                where: {
                    OR: [
                        { userId },
                        { isDefault: true },
                    ],
                },
            })

            return categories
        })
    //  Criar
    app.withTypeProvider<ZodTypeProvider>().post(
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
            const { userId } = await protectRoutes(request, reply)
            const { name, color } = request.body

            const category = await prisma.category.create({
                data: {
                    name,
                    color,
                    userId,
                }
            })

            return category
        }
    )
    // Atualizar
    app.withTypeProvider<ZodTypeProvider>().patch(
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
            const { userId } = await protectRoutes(request, reply)
            const { categoryId, color } = request.body

            const categoryExists = await prisma.category.findUnique({
                where: {
                    id: categoryId,
                    userId
                }
            })

            if (!categoryExists) {
                return reply.status(404).send({ message: "Category not found" })
            }

            const updatedCategory = await prisma.category.update({
                where: {
                    id: categoryId,
                    userId
                },
                data: {
                    color
                }
            })

            return updatedCategory
        }
    )
} 