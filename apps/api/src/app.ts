import '../src/types';

import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastify, { FastifyInstance, FastifyRequest } from "fastify";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyAuth from '@fastify/auth';

import datasourcePlugin from "./plugins/datasource";
import mailerPlugin from './plugins/mailer';
import templatePreview from './plugins/templatePreview';
import { errorHandler } from "./handlers/error-handlers";
import { authRoutes } from "./modules/auth/auth.route";
import { userRoutes } from './modules/user/user.route';
import { publicUserRoutes } from './modules/user/user.public.route';
import { categoriesRoutes } from "./modules/category/categories.route";
import { financialRecordsRoutes } from './modules/financial-record/financial-record.route';
import { z } from 'zod';
import fastifyCookie from '@fastify/cookie';
import { hostname as host } from 'os';
import pkg from '../package.json'
import { env } from '@topobre/env';
import { logger } from '@topobre/winston'
import fastifyMultipart from '@fastify/multipart';

const logLevelMap = {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal',
};

import { verifySession } from './plugins/authenticate';
import { hasRole, isOwner } from './plugins/authorization';

const appRoutes = async (app: FastifyInstance, opts: any) => {
    // Rotas públicas
    await app.register(authRoutes, { prefix: 'auth' });
    await app.register(publicUserRoutes, { prefix: 'users' });

    // Rotas que precisam de autenticação
    app.register(async (authenticatedApp) => {
        // Aplica o hook de autenticação a todas as rotas neste escopo
        authenticatedApp.addHook('preHandler', authenticatedApp.auth([verifySession]));

        await authenticatedApp.register(financialRecordsRoutes, { prefix: 'financial-records' });
        await authenticatedApp.register(categoriesRoutes, { prefix: 'categories' });
        await authenticatedApp.register(userRoutes, { prefix: 'users' });
    });

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
        const isDbConnected = app.db.dataSource.isInitialized;
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
            level: env.NODE_ENV === 'production' ? 'info' : 'trace',
            stream: {
                write: (message: string) => {
                    try {
                        const parsed = JSON.parse(message);
                        const msg = parsed.msg || parsed.message || message;
                        const hostname = host || 'server';
                        const levelName = logLevelMap[parsed.level as keyof typeof logLevelMap] || 'info';

                        const loggerMethods: Record<string, (...args: any[]) => void> = logger as any;
                        if (typeof loggerMethods[levelName] === 'function') {
                            loggerMethods[levelName](`${hostname} -> ${msg}`);
                        } else {
                            logger.info(`[API] ${hostname} -> ${msg}`);
                        }
                    } catch {
                        // Fallback em caso de erro no parse
                        logger.info(`[API] server -> ${message.trim()}`);
                    }
                },
            },
        },
    }).withTypeProvider<ZodTypeProvider>();

    await app.register(fastifyMultipart);
    await app.register(datasourcePlugin);
    await app.register(import('@fastify/jwt'), { secret: env.JWT_SECRET });
    await app.register(fastifyAuth);
    await app.register(fastifyCookie, { secret: env.COOKIE_SECRET });
    await app.register(mailerPlugin);
    await app.register(templatePreview, {
        devMode: env.NODE_ENV !== 'production',
        prefix: '/__dev'
    });

    app.register(fastifyCors, {
        origin: [`http://localhost:${env.PORT}`, 'https://topobre.crudbox.com.br'],
        allowedHeaders: ["Authorization", "Content-Type"],
        credentials: true,
    });

    app.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'ToPobre API de Finanças',
                description: pkg.description,
                version: pkg.version,
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
            security: [{ bearerAuth: [] }],
        },
        transform: jsonSchemaTransform
    });

    app.register(fastifySwaggerUi, {
        routePrefix: 'docs',
    });

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);
    app.setErrorHandler(errorHandler);

    app.register(appRoutes, { prefix: 'api/v1' });

    return app;
};
