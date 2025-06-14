import { z } from 'zod';

const createUserSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    phone: z.string().optional(),
});

const createUserResponseSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    phone: z.string().nullable(),
    user_metadata: z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        email_verified: z.boolean().optional(),
        phone_verified: z.boolean().optional(),
        sub: z.string().uuid().optional()
    }).nullable(),
    created_at: z.string(),
    updated_at: z.string(),
})

type CreateUserInput = z.infer<typeof createUserSchema>

export {
    createUserSchema,
    createUserResponseSchema,
    CreateUserInput,
}