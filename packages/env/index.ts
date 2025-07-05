import dotenv from 'dotenv'
import { z } from 'zod'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const preprocessEmptyString = (val: unknown) => (val === '' ? undefined : val);

const serverSchema = z.object({
    // Variáveis privadas (acessadas apenas no servidor)
    PGHOST: z.preprocess(preprocessEmptyString, z.string()),
    PGDATABASE: z.preprocess(preprocessEmptyString, z.string()),
    PGUSER: z.preprocess(preprocessEmptyString, z.string()),
    PGPASSWORD: z.preprocess(preprocessEmptyString, z.string()),
    RESEND_API_KEY: z.preprocess(preprocessEmptyString, z.string()),
    JWT_SECRET: z.preprocess(preprocessEmptyString, z.string()),
    COOKIE_SECRET: z.preprocess(preprocessEmptyString, z.string()),
    REDIS_HOST: z.preprocess(preprocessEmptyString, z.string()),
    REDIS_PORT: z.coerce.number(),
    REDIS_USERNAME: z.preprocess(preprocessEmptyString, z.string().optional()),
    REDIS_PASSWORD: z.preprocess(preprocessEmptyString, z.string().optional()),
    REDIS_TOKEN: z.preprocess(preprocessEmptyString, z.string().optional()),
    GEMINI_API_KEY: z.preprocess(preprocessEmptyString, z.string()),
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: z.preprocess(preprocessEmptyString, z.string()),
    PROMETHEUS_PORT: z.coerce.number()
});

const clientSchema = z.object({
    // Apenas variáveis que comecem com NEXT_PUBLIC_ ficarão acessíveis no browser
    NEXT_PUBLIC_API_URL: z.preprocess(preprocessEmptyString, z.string().url()),
});

const sharedSchema = z.object({
    // Variáveis acessíveis em qualquer lugar (útil em ambos)
    HOST: z.preprocess(preprocessEmptyString, z.string().default('0.0.0.0')),
    PORT: z.coerce.number().default(3001),
    JWT_EXPIRES_IN: z.preprocess(preprocessEmptyString, z.string().default('1d')),
    NODE_ENV: z.preprocess(preprocessEmptyString, z.enum(['development', 'production', 'test']).default('development')),
});

const envSchema = serverSchema.merge(clientSchema).merge(sharedSchema);

export const env = envSchema.parse(process.env);