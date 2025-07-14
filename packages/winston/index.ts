import winston from "winston"
import { env } from '@topobre/env'
import LokiTransport from 'winston-loki';
// import { OpenTelemetryTransport } from './OpenTelemetryTransport';

export const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.splat(),
                winston.format.printf((info: any) => {
                    if (info.stack) {
                        return `[${info.timestamp}] [${info.level}] //-> ${info.stack}`
                    }
                    return `[${info.timestamp}] [${info.level}] -> ${String(info.message).trim()}`
                })
            ),
            level: env.NODE_ENV !== 'production' ? 'debug' : 'info'
        }),
        new winston.transports.File({
            filename: 'errors.json',
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),
        // Adiciona o transport do OpenTelemetry
        // new OpenTelemetryTransport(),
        new LokiTransport({
            host: env.LOKI_ENDPOINT,
            labels: { service: 'topobre-api', env: env.NODE_ENV || 'dev' },
            json: true,
            replaceTimestamp: true,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            onConnectionError: (err) => {
                winston.error('[LOKI] Connection error:', err);
            }
        })
    ]
})
