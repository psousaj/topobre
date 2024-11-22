import { z } from 'zod'

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_PUBLISHABLE_KEY: z.string().min(1),
    PORT: z.string().transform(Number).default('3001'),
    HOST: z.string().default('0.0.0.0'),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.format())
    throw new Error('Invalid environment variables.')
}

export const env = _env.data 