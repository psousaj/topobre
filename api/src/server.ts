import 'dotenv/config'
import { fastify } from 'fastify';
import {
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider
} from 'fastify-type-provider-zod';
import { fastifyCors } from '@fastify/cors'
import { clerkPlugin } from '@clerk/fastify'
import { env } from './env'
import { transactionsRoutes } from './routes/transactions'
import { categoriesRoutes } from './routes/categories'
import { errorHandler } from './error-handlers';

const app = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

app.register(clerkPlugin)
app.register(fastifyCors, {
    origin: ['http://localhost:3000', 'http://topobre.crudbox.com.br'],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.setErrorHandler(errorHandler)

app.register(transactionsRoutes, { prefix: '/transactions' })
app.register(categoriesRoutes, { prefix: '/categories' })

app.listen({
    port: Number(env.PORT),
    host: env.HOST,
}).then(() => {
    console.log(`🚀 HTTP Server running on port ${env.PORT}`)
}).catch((error) => {
    app.log.error(error)
    process.exit(1)
})

