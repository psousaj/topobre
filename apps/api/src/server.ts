if (process.env.NODE_ENV === 'production') {
    require('module-alias/register');
}
import { initTelemetry } from '@topobre/telemetry';
import { buildApp } from "./app";
import { bootstrapLogger } from './shared/bootstrapLogger';
import { env } from '@topobre/env';

// Inicializa a telemetria ANTES de qualquer outra coisa
initTelemetry(process.env.OTEL_SERVICE_NAME || 'api');

const start = async () => {
    const app = await buildApp();

    try {
        await app.listen({ port: env.API_PORT, host: env.API_HOST });

        bootstrapLogger(app)

        app.log.info(`🚀 Servidor rodando em http://${env.API_HOST}:${env.API_PORT} 🚀`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
