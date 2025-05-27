import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastify, { FastifyInstance } from "fastify";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fjwt, { FastifyJWT } from "@fastify/jwt";
import fCookie from "@fastify/cookie";

import datasourcePlugin from "./plugins/datasource";
import { errorHandler } from "./shared/error-handlers";
import { transactionsRoutes } from "./modules/transaction/transactions";
import { authRoutes } from "./modules/auth/auth.route";
import { categoriesRoutes } from "./modules/category/categories.route";
import { env } from "./shared/env";
import { authHandler } from "./plugins/authenticate";

const appRoutes = async (app: FastifyInstance, opts: any) => {
    await app.register(transactionsRoutes, { prefix: 'transactions' })
    await app.register(authRoutes, { prefix: 'auth' })
    await app.register(categoriesRoutes, { prefix: 'categories' })
    await app.register(categoriesRoutes, { prefix: 'users' })
}


export const buildApp = async () => {
    const app = fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();

    // Plugins
    app.register(datasourcePlugin);
    //  Cors
    app.register(fastifyCors, {
        origin: [`http://localhost:${env.PORT}`, 'https://topobre.crudbox.com.br'],
        allowedHeaders: ["Authorization", "Content-Type"],
        credentials: true,
    })
    // JWT
    app.register(fjwt, { secret: env.JWT_SECRET, sign: { expiresIn: env.JWT_EXPIRES_IN } });
    app.addHook('preHandler', (req, res, next) => {
        req.jwt = app.jwt;
        return next();
    })

    app.decorate('authenticate', authHandler);

    // Configuração do Swagger
    app.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'ToPobre API de Finanças',
                description: 'Documentação da API para gerenciamento de finanças pessoais',
                version: '1.1.2',
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
    app.setErrorHandler(errorHandler)

    // ROTAS
    app.register(appRoutes, { prefix: 'api/v1/' })

    return app;
};
