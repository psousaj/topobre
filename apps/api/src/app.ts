import '../src/types';

import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastify, { FastifyInstance } from "fastify";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import fastifySwaggerUi from "@fastify/swagger-ui";

import datasourcePlugin from "./plugins/datasource";
import authPlugin from './plugins/authenticate';
import jwtPlugin from './plugins/jwt';
import mailerPlugin from './plugins/mailer';
import templatePreview from './plugins/templatePreview';
import { errorHandler } from "./config/error-handlers";
import { authRoutes } from "./modules/auth/auth.route";
import { userRoutes } from './modules/user/user.route';
import { categoriesRoutes } from "./modules/category/categories.route";
import { financialRecordsRoutes } from './modules/financial-record/financial-record.route';
import { z } from 'zod';
import fastifyCookie from '@fastify/cookie';
import { hostname } from 'os';
import pkg from '../package.json'
import { env } from '@topobre/env';
import { logger } from '@topobre/winston'

const appRoutes = async (app: FastifyInstance, opts: any) => {
    await app.register(financialRecordsRoutes, { prefix: 'transactions' })
    await app.register(authRoutes, { prefix: 'auth' })
    await app.register(categoriesRoutes, { prefix: 'categories' })
    await app.register(userRoutes, { prefix: 'users' })
    app.get('/health', {
        schema: {
            tags: ['Health check'],
            description: 'Health check',
            response: {
                200: z.object({
                    status: z.string(),
                    database: z.string(),
                    timestamp: z.string(),
                })
            }
        }
    }, async (req, rep) => {
        const isDbConnected = app.db.isConnected ? app.db.isConnected() : app.db.dataSource.isInitialized;

        return rep.send({
            status: 'ok',
            database: isDbConnected ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString()
        });
    });
}

export const buildApp = async () => {
    const app = fastify({
        logger: {
            level: env.NODE_ENV === 'production' ? 'info' : 'debug',
            stream: {
                write: (message: string) => {
                    try {
                        const parsed = JSON.parse(message)
                        const msg = parsed.msg || parsed.message || message
                        const hostname = parsed.hostname || 'server';
                        logger.info(`${hostname} -> ${msg}`)
                    } catch {
                        logger.info(`${hostname} -> ${message.trim()}`)
                    }
                }
            }
        }
    }).withTypeProvider<ZodTypeProvider>();

    // 1. PRIMEIRO: Plugin do banco de dados
    await app.register(datasourcePlugin);

    // 2. SEGUNDO: Plugin JWT (precisa estar antes do auth)
    await app.register(jwtPlugin);

    // 3. TERCEIRO: Plugin de autenticação (depende do JWT e DB)
    await app.register(authPlugin);

    // 4. QUARTO: Cookie
    await app.register(fastifyCookie, {
        secret: env.COOKIE_SECRET
    });

    // 5. QUINTO: Mailer
    await app.register(mailerPlugin);

    // 6. SEXTO: Template preview
    await app.register(templatePreview, {
        devMode: env.NODE_ENV !== 'production',
        prefix: '/__dev'
    });

    // Cors
    app.register(fastifyCors, {
        origin: [`http://localhost:${env.PORT}`, 'https://topobre.crudbox.com.br'],
        allowedHeaders: ["Authorization", "Content-Type"],
        credentials: true,
    });

    // Configuração do Swagger
    app.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'ToPobre API de Finanças',
                description: pkg.description,
                version: pkg.version,
            },
        },
        transform: jsonSchemaTransform
    });

    app.register(fastifySwaggerUi, {
        routePrefix: 'docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: true,
        },
        staticCSP: true,
        transformStaticCSP: (header) => header,
    });

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);
    app.setErrorHandler(errorHandler);

    // ROTAS
    app.register(appRoutes, { prefix: 'api/v1' });

    return app;
};