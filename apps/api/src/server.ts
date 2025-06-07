import 'dotenv/config'
import { env } from './shared/env'
import { buildApp } from "./app";
import { bootstrapLogger } from './config/bootstrapLogger';

const start = async () => {
    const app = await buildApp();

    try {
        await app.listen({ port: env.PORT, host: env.HOST });

        bootstrapLogger(app)

        app.log.info(`🚀 Servidor rodando em http://${env.HOST}:${env.PORT} 🚀`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
