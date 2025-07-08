import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod'
import { existsSync } from 'fs';
import { resolve } from 'path';


// Função para tentar localizar .env na raiz do monorepo,
// subindo da pasta do arquivo atual em dev ou prod

function findMonorepoRootEnv() {
    // __dirname aponta pra src em dev e dist/src em build
    // vamos tentar algumas resoluções relativas para pegar a raiz

    // 1) Tentar .env na raiz subindo 3 níveis (ex: dev: /src -> ../../../.env)
    let possiblePath = resolve(__dirname, '../../../.env');
    if (existsSync(possiblePath)) return possiblePath;

    // 2) Tentar 4 níveis (ex: build: /dist/src -> ../../../../.env)
    possiblePath = resolve(__dirname, '../../../../.env');
    if (existsSync(possiblePath)) return possiblePath;

    // 3) fallback pra CWD + '.env' (menos recomendado)
    possiblePath = resolve(process.cwd(), '.env');
    if (existsSync(possiblePath)) return possiblePath;

    // Se não achar, retorna undefined (ou null)
    return undefined;
}

const envPath = findMonorepoRootEnv();
if (envPath) {
    dotenvConfig({ path: envPath });
    console.log('🔍 Carregado .env de:', envPath);
} else {
    console.log('⚠️ Arquivo .env não encontrado.');
}

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
    REDIS_HOST: z.preprocess(preprocessEmptyString, z.string()).optional(),
    REDIS_PORT: z.coerce.number().optional(),
    REDIS_USERNAME: z.preprocess(preprocessEmptyString, z.string().optional()),
    REDIS_PASSWORD: z.preprocess(preprocessEmptyString, z.string().optional()),
    REDIS_TOKEN: z.preprocess(preprocessEmptyString, z.string().optional()),
    UPSTASH_REDIS_URL: z.preprocess(preprocessEmptyString, z.string().optional()),
    GEMINI_API_KEY: z.preprocess(preprocessEmptyString, z.string()),
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: z.preprocess(preprocessEmptyString, z.string()),
    PROMETHEUS_PORT: z.coerce.number().default(9090),
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