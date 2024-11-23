"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fastify_1 = require("fastify");
const fastify_type_provider_zod_1 = require("fastify-type-provider-zod");
const cors_1 = require("@fastify/cors");
const fastify_2 = require("@clerk/fastify");
const env_1 = require("./env");
const transactions_1 = require("./routes/transactions");
const categories_1 = require("./routes/categories");
const error_handlers_1 = require("./error-handlers");
const app = (0, fastify_1.fastify)({ logger: true }).withTypeProvider();
app.register(fastify_2.clerkPlugin);
app.register(cors_1.fastifyCors, {
    origin: ['http://localhost:3000', 'http://topobre.crudbox.com.br'],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
});
app.setValidatorCompiler(fastify_type_provider_zod_1.validatorCompiler);
app.setSerializerCompiler(fastify_type_provider_zod_1.serializerCompiler);
app.setErrorHandler(error_handlers_1.errorHandler);
app.register(transactions_1.transactionsRoutes, { prefix: '/transactions' });
app.register(categories_1.categoriesRoutes, { prefix: '/categories' });
app.listen({
    port: env_1.env.PORT,
    host: env_1.env.HOST,
}).then(() => {
    console.log(`🚀 HTTP Server running on port ${env_1.env.PORT}`);
}).catch((error) => {
    app.log.error(error);
    process.exit(1);
});
