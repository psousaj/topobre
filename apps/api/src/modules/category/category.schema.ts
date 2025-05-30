import z from "zod";

export const categorySchema = z.object({
    name: z.string().min(4),
    color: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Deve ser uma cor HEX válida"),
    isDefault: z.boolean().optional()
})

export const categoryResponseSchema = categorySchema.extend({
    displayName: z.string(),
    id: z.string().uuid(),
})