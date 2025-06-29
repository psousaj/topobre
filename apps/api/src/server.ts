import 'dotenv/config'
import { initTelemetry } from '@topobre/telemetry';
import { buildApp } from "./app";
import { bootstrapLogger } from './shared/bootstrapLogger';
import { env } from '@topobre/env';

// Inicializa a telemetria ANTES de qualquer outra coisa
initTelemetry('api');

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
