import winston from "winston"
// import { TransformableInfo } from "logform"
import { env } from "./env"

const logger = winston.createLogger({
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
                        return `${info.timestamp} ${info.level} ${info.stack}`
                    }
                    return `${info.timestamp} ${info.level} ${String(info.message).trim()}`
                })
            ),
            level: env.NODE_ENV !== 'production' ? 'debug' : 'info'
        }),
        // new winston.transports.File({
        //     filename: 'logs.json',
        //     level: 'info',
        //     format: winston.format.combine(
        //         winston.format.timestamp(),
        //         winston.format.json()
        //     )
        // }),
        new winston.transports.File({
            filename: 'errors.json',
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ]
})

export { logger }