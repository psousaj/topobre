import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod'
import { existsSync } from 'fs';
import { resolve } from 'path';

function findMonorepoRootEnv() {
    const filenames = ['.env.prod', '.env'];

    for (const filename of filenames) {
        let possiblePath = resolve(__dirname, '../../', filename);
        if (existsSync(possiblePath)) return possiblePath;

        possiblePath = resolve(__dirname, '../../../', filename);
        if (existsSync(possiblePath)) return possiblePath;

        possiblePath = resolve(process.cwd(), filename);
        if (existsSync(possiblePath)) return possiblePath;

    }

    return undefined;
}

const envPath = findMonorepoRootEnv();

if (envPath && process.env.NODE_ENV !== 'production') {
    dotenvConfig({ path: envPath });
    console.log('🔍 Carregado .env de:', envPath);
} else {
    console.log('⚠️ .env não carregado (modo produção ou arquivo ausente).');
}

const preprocessEmptyString = (val: unknown) => (val === '' ? undefined : val);

const serverSchema = z.object({
    API_COOKIE_SECRET: z.preprocess(preprocessEmptyString, z.string()),
});

const clientSchema = z.object({
    // Apenas variáveis que comecem com NEXT_PUBLIC_ ficarão acessíveis no browser
    NEXT_PUBLIC_API_URL: z.preprocess(preprocessEmptyString, z.string().url()),
});

const sharedSchema = z.object({
    // Variáveis acessíveis em qualquer lugar (útil em ambos)
    API_HOST: z.preprocess(preprocessEmptyString, z.string().default('0.0.0.0')),
    API_PORT: z.coerce.number().default(3003),
    PGHOST: z.preprocess(preprocessEmptyString, z.string()),
    PGDATABASE: z.preprocess(preprocessEmptyString, z.string()),
    PGUSER: z.preprocess(preprocessEmptyString, z.string()),
    PGPASSWORD: z.preprocess(preprocessEmptyString, z.string()),
    REDIS_HOST: z.preprocess(preprocessEmptyString, z.string()).optional(),
    REDIS_PORT: z.coerce.number().optional(),
    REDIS_USERNAME: z.preprocess(preprocessEmptyString, z.string().optional()),
    REDIS_PASSWORD: z.preprocess(preprocessEmptyString, z.string().optional()),
    UPSTASH_REDIS_URL: z.preprocess(preprocessEmptyString, z.string().optional()),
    JWT_SECRET: z.preprocess(preprocessEmptyString, z.string()),
    JWT_EXPIRATION: z.preprocess(preprocessEmptyString, z.string().default('1d')),
    GEMINI_API_KEY: z.preprocess(preprocessEmptyString, z.string()),
    OTEL_EXPORTER_OTLP_TRACES: z.preprocess(preprocessEmptyString, z.string()),
    PROMETHEUS_PORT: z.coerce.number().default(9090),
    PROMETHEUS_HOST: z.preprocess(preprocessEmptyString, z.string().default('localhost')),
    LOKI_ENDPOINT: z.preprocess(preprocessEmptyString, z.string()),
    RESEND_API_KEY: z.preprocess(preprocessEmptyString, z.string()),
    NODE_ENV: z.preprocess(preprocessEmptyString, z.enum(['development', 'production', 'test']).default('development')),
});

const envSchema = serverSchema.merge(clientSchema).merge(sharedSchema);

export const env = envSchema.parse(process.env);