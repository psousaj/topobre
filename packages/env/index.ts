import dotenv from 'dotenv'
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const env = createEnv({
    server: {
        // Variáveis privadas (acessadas apenas no servidor)
        PGHOST: z.string(),
        PGDATABASE: z.string(),
        PGUSER: z.string(),
        PGPASSWORD: z.string(),
        RESEND_API_KEY: z.string(),
        JWT_SECRET: z.string(),
        COOKIE_SECRET: z.string(),
        REDIS_HOST: z.string(),
        REDIS_PORT: z.coerce.number(),
        REDIS_PASSWORD: z.string(),
        GEMINI_API_KEY: z.string(),
        // SUPABASE_SERVICE_ROLE_KEY: z.string(),
        NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    },
    client: {
        // Apenas variáveis que comecem com NEXT_PUBLIC_ ficarão acessíveis no browser
        NEXT_PUBLIC_API_URL: z.string().url(),
    },
    shared: {
        // Variáveis acessíveis em qualquer lugar (útil em ambos)
        HOST: z.string().default('0.0.0.0'),
        PORT: z.coerce.number().default(3001),
        JWT_EXPIRES_IN: z.string().default('1d'),
        // SUPABASE_URL: z.string().url(),
        // SUPABASE_ANON_KEY: z.string(),
    },
    runtimeEnv: {
        PGHOST: process.env.PGHOST,
        PGDATABASE: process.env.PGDATABASE,
        PGUSER: process.env.PGUSER,
        PGPASSWORD: process.env.PGPASSWORD,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        JWT_SECRET: process.env.JWT_SECRET,
        COOKIE_SECRET: process.env.COOKIE_SECRET,
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT,
        REDIS_PASSWORD: process.env.REDIS_PASSWORD,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        HOST: process.env.HOST,
        PORT: process.env.PORT,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
        // SUPABASE_URL: process.env.SUPABASE_URL,
        // SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        // SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    emptyStringAsUndefined: true,
})
