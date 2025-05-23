import { z } from 'zod'


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
    accessToken: z.string(),
})


type LoginUserInput = z.infer<typeof loginSchema>

export {
    loginSchema,
    loginResponseSchema,
    LoginUserInput,
}