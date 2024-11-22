import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function categoriesRoutes(app: FastifyInstance) {
    app.addHook('preHandler', async (request) => {
        if (!request.auth.userId) {
            throw new Error('Unauthorized')
        }
    })

    app.get('/', async (request) => {
        const categories = await prisma.category.findMany({
            where: {
                OR: [
                    { userId: request.auth.userId },
                    { isDefault: true },
                ],
            },
        })

        return categories
    })

    app.post('/', async (request) => {
        const createCategorySchema = z.object({
            name: z.string(),
            color: z.string(),
        })

        const data = createCategorySchema.parse(request.body)

        const category = await prisma.category.create({
            data: {
                ...data,
                userId: request.auth.userId,
            },
        })

        return category
    })
} 