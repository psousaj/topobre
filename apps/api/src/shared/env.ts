import { z } from 'zod'
import * as dotenv from 'dotenv'

// Define o schema uma única vez para ser usado em todos os ambientes
const envSchema = z.object({
    PGHOST: z.string({ message: "Provides PGHOST env. *hint: check .env file for set" }),
    PGDATABASE: z.string({ message: "Provides PGDATABASE env. *hint: check .env file for set" }),
    PGUSER: z.string({ message: "Provides PGUSER env. *hint: check .env file for set" }),
    PGPASSWORD: z.string({ message: "Provides PGPASSWORD env. *hint: check .env file for set" }),
    PORT: z.string().transform((val) => Number(val)).default('3001'),
    HOST: z.string().default('0.0.0.0'),
    REDIS_HOST: z.string().ip(),
    REDIS_PORT: z.string().transform((val) => Number(val)).default('6379'),
    REDIS_PASSWORD: z.string(),
    JWT_SECRET: z.string().min(1, { message: "JWT_SECRET is required" }),
    COOKIE_SECRET: z.string().min(1, { message: "COOKIE_SECRET is required" }),
    JWT_EXPIRES_IN: z.string().default('1d'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
    // Em desenvolvimento, carrega do .env
    if (process.env.NODE_ENV !== 'production') {
        const result = dotenv.config()
        if (result.error) {
            console.error('❌ Erro ao carregar o arquivo .env:', result.error)
            throw new Error('Arquivo .env não encontrado ou inválido.')
        }
    }

    // Em produção, garantimos alguns valores padrão
    if (process.env.NODE_ENV === 'production') {
        process.env.PORT = process.env.PORT || '3001'
        process.env.HOST = process.env.HOST || '0.0.0.0'
    }

    // Valida as variáveis de ambiente
    const parsed = envSchema.safeParse(process.env)

    if (!parsed.success) {
        console.error('❌ Validação das variáveis de ambiente falhou:')
        console.error(parsed.error.format())
        throw new Error('Variáveis de ambiente inválidas')
    }

    return parsed.data
}

export const env = loadEnv()
