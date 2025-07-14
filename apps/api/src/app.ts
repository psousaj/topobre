import '../src/types';

// import '../debug/debugRedis'; // tem que vir antes de qualquer import que use ioredis

import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastify, { FastifyInstance, FastifyRequest } from "fastify";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyAuth from '@fastify/auth';
import fastifyMultipart from '@fastify/multipart';
import fastifyCookie from '@fastify/cookie';
import { hostname as host } from 'os';
import { env } from '@topobre/env';
import { z } from 'zod';

import datasourcePlugin from "./plugins/datasource";
import authorizationPlugin from './plugins/authorization';
import mailerPlugin from './plugins/mailer';
import templatePreview from './plugins/templatePreview';
import { errorHandler } from "./handlers/error-handlers";
import { authRoutes } from "./modules/auth/auth.route";
import { userRoutes } from './modules/user/user.route';
import { publicUserRoutes } from './modules/user/user.public.route';
import { categoriesRoutes } from "./modules/category/categories.route";
import { financialRecordsRoutes } from './modules/financial-record/financial-record.route';
import { logger } from '@topobre/winston'
import pkg from '../package.json'


const logLevelMap = {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal',
};

import { verifySession } from './plugins/authenticate';
import fastifyJwt from '@fastify/jwt';

const appRoutes = async (app: FastifyInstance, opts: any) => {
    // Rotas públicas
    await app.register(authRoutes, { prefix: 'auth' });
    await app.register(publicUserRoutes, { prefix: 'users' });

    // Rotas que precisam de autenticação
    app.register(async (authenticatedApp) => {
        // Aplica o hook de autenticação a todas as rotas neste escopo
        authenticatedApp.addHook('preHandler', authenticatedApp.auth([verifySession]));

        await authenticatedApp.register(financialRecordsRoutes, { prefix: 'transactions' });
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
                            loggerMethods[levelName](`[API] ${hostname} -> ${msg}`);
                        } else {
                            logger.info(`[API] ${hostname} <-> ${msg.trim()}`);
                        }
                    } catch {
                        // Fallback em caso de erro no parse
                        logger.info(`[API] ${host} <-> ${message.trim()}`);
                    }
                },
            },
        },
    }).withTypeProvider<ZodTypeProvider>();

    await app.register(fastifyMultipart);
    await app.register(datasourcePlugin);
    await app.register(authorizationPlugin);
    await app.register(fastifyAuth);
    await app.register(fastifyJwt, {
        secret: env.JWT_SECRET,
    });
    await app.register(fastifyCookie, { secret: env.API_COOKIE_SECRET });
    await app.register(mailerPlugin);
    await app.register(templatePreview, {
        devMode: env.NODE_ENV !== 'production',
        prefix: '/__dev'
    });

    app.register(fastifyCors, {
        origin: [`http://localhost:${env.API_PORT}`, 'https://topobre.crudbox.com.br'],
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

    app.register(appRoutes, { prefix: env.API_PREFIX });

    return app;
};
