import 'dotenv/config'
import { fastify } from 'fastify';
import {
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider,
    jsonSchemaTransform,
} from 'fastify-type-provider-zod';
import { fastifyCors } from '@fastify/cors'
import { clerkPlugin } from '@clerk/fastify'
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { transactionsRoutes } from './routes/transactions'
import { categoriesRoutes } from './routes/categories'
import { errorHandler } from './error-handlers';
import { env } from './env'

const app = fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();

app.register(clerkPlugin)
app.register(fastifyCors, {
    origin: ['http://localhost:3000', 'http://topobre.crudbox.com.br'],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
})
// Configuração do Swagger
app.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'ToPobre API de Finanças',
            description: 'Documentação da API para gerenciamento de finanças pessoais',
            version: '1.0.0',
        },
    },
    // Importante adicionar para fazer o parse do schema
    transform: jsonSchemaTransform
});
app.register(fastifySwaggerUI, {
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

app.register(transactionsRoutes, { prefix: 'transactions' })
app.register(categoriesRoutes, { prefix: 'categories' })

app.listen({
    port: Number(env.PORT),
    host: env.HOST,
}).then(() => {
    console.log(`🚀 HTTP Server running on port ${env.PORT}`)
}).catch((error) => {
    app.log.error(error)
    process.exit(1)
})

