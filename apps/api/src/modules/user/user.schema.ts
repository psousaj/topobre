import { z } from 'zod';

const createUserSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    phone: z.string().optional(),
});

const createUserResponseSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    phone: z.string().nullable(),
    isActive: z.boolean(),
})

type CreateUserInput = z.infer<typeof createUserSchema>

export {
    createUserSchema,
    createUserResponseSchema,
    CreateUserInput,
}