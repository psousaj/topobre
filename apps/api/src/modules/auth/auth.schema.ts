import { z } from 'zod'
import { createUserSchema } from '../user/user.schema'


const loginSchema = z.object({
    email: z
        .string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string',
        })
        .email(),
    password: z.string().min(6),
})

const loginResponseSchema = z.object({
    user: z.object({
        userId: z.string(),
        name: z.string(),
        email: z.string(),
    }),
    accessToken: z.string(),
})


type LoginUserInput = z.infer<typeof loginSchema>

const meResponseSchema = z.object({
    user: z.object({
        userId: z.string(),
        name: z.string(),
        email: z.string(),
    }),
})

export {
    loginSchema,
    meResponseSchema,
    loginResponseSchema,
    LoginUserInput,
}