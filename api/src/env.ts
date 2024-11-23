import { z } from 'zod'
import * as dotenv from 'dotenv'

let env: any
if (process.env.NODE_ENV === "production") {
    process.env.PORT = '3001'
    process.env.HOST = '0.0.0.0'
    // 
    env = process.env
} else {
    const result = dotenv.config()

    if (result.error) {
        console.error('❌ Erro ao carregar o arquivo .env:', result.error)
        throw new Error('Arquivo .env não encontrado ou inválido.')
    }

    const envSchema = z.object({
        DATABASE_URL: z.string(),
        CLERK_SECRET_KEY: z.string(),
        CLERK_PUBLISHABLE_KEY: z.string(),
        PORT: z.string().transform(Number).default('3001'),
        HOST: z.string().default('0.0.0.0'),
    })

    const _env = envSchema.safeParse(process.env)

    // Verifica se as variáveis de ambiente são válidas
    if (!_env.success) {
        console.error('❌ Variáveis de ambiente inválidas:', _env.error.format())
        throw new Error('Variáveis de ambiente inválidas.')
    }

    env = _env.data
}

export { env }