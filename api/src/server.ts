import fastify from 'fastify'
import cors from '@fastify/cors'
import { clerkPlugin } from '@clerk/fastify'
import { env } from './env'
import { transactionsRoutes } from './routes/transactions'
import { categoriesRoutes } from './routes/categories'

const app = fastify()

app.register(cors, {
    origin: ['http://localhost:3000'],
    credentials: true,
})

app.register(clerkPlugin)

app.register(transactionsRoutes, { prefix: '/transactions' })
app.register(categoriesRoutes, { prefix: '/categories' })

app.listen({
    port: env.PORT,
    host: env.HOST,
}).then(() => {
    console.log(`🚀 HTTP Server running on port ${env.PORT}`)
}) 