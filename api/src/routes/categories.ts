import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { protectRoutes } from '../lib/clerk'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

const categorySchema = z.object({
    name: z.string().min(4),
    color: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Deve ser uma cor HEX válida"),
    isDefault: z.boolean().optional()
})

export async function categoriesRoutes(app: FastifyInstance) {
    // Listagem
    app.withTypeProvider<ZodTypeProvider>().get(
        '/',
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
                body: categorySchema
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
                body: z.object({
                    categoryId: z.string(),
                }).merge(categorySchema.pick({ color: true }))
            }
        },
        async (request, reply) => {
            const { userId } = await protectRoutes(request, reply)
            const { categoryId, color } = request.body

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