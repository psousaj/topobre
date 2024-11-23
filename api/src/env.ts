import { z } from 'zod'
import * as dotenv from 'dotenv'

// Define o schema uma única vez para ser usado em todos os ambientes
const envSchema = z.object({
    DATABASE_URL: z.string().url('DATABASE_URL deve ser uma URL válida'),
    CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY é obrigatória'),
    CLERK_PUBLISHABLE_KEY: z.string().min(1, 'CLERK_PUBLISHABLE_KEY é obrigatória'),
    PORT: z.string().transform((val) => Number(val)).default('3001'),
    HOST: z.string().default('0.0.0.0'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

// Infere o tipo do schema para usar no resto da aplicação
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

// Carrega e exporta as variáveis de ambiente validadas
export const env = loadEnv()

// Exemplo de uso em outro arquivo:
// import { env } from './config/env'
// const port = env.PORT // TypeScript sabe que é number
// const host = env.HOST // TypeScript sabe que é string