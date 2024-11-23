"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesRoutes = categoriesRoutes;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const clerk_1 = require("../lib/clerk");
const categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(4),
    color: zod_1.z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Deve ser uma cor HEX válida"),
    isDefault: zod_1.z.boolean().optional()
});
async function categoriesRoutes(app) {
    // Listagem
    app.withTypeProvider().get('/', async (request, reply) => {
        const { userId } = await (0, clerk_1.protectRoutes)(request, reply);
        const categories = await prisma_1.prisma.category.findMany({
            where: {
                OR: [
                    { userId },
                    { isDefault: true },
                ],
            },
        });
        return categories;
    });
    //  Criar
    app.withTypeProvider().post('/', {
        schema: {
            body: categorySchema
        }
    }, async (request, reply) => {
        const { userId } = await (0, clerk_1.protectRoutes)(request, reply);
        const { name, color } = request.body;
        const category = await prisma_1.prisma.category.create({
            data: {
                name,
                color,
                userId,
            }
        });
        return category;
    });
    // Atualizar
    app.withTypeProvider().patch('/', {
        schema: {
            body: zod_1.z.object({
                categoryId: zod_1.z.string(),
            }).merge(categorySchema.pick({ color: true }))
        }
    }, async (request, reply) => {
        const { userId } = await (0, clerk_1.protectRoutes)(request, reply);
        const { categoryId, color } = request.body;
        const updatedCategory = await prisma_1.prisma.category.update({
            where: {
                id: categoryId,
                userId
            },
            data: {
                color
            }
        });
        return updatedCategory;
    });
}
