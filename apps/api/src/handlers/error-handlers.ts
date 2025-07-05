import { logger } from "@topobre/winston";
import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";

type FastifyErrorHandler = FastifyInstance['errorHandler'];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
    // Log completo com stack trace
    logger.error(`[API ERROR] ${error.message}`, {
        stack: error.stack,
        url: request.url,
        method: request.method,
        user: request.user, // opcional, se você adiciona request.user
    });

    // Zod validation error
    if (error instanceof ZodError) {
        return reply.status(400).send({
            statusCode: 400,
            message: 'Invalid input',
            errors: error.flatten().fieldErrors,
        });
    }

    // Fastify schema validation error
    const fastifyValidationMatch = error.message?.match(/^(params|body|querystring|headers)\/(\w+)\s(.+)$/);
    if (fastifyValidationMatch) {
        const [, location, field, message] = fastifyValidationMatch;
        return reply.status(400).send({
            statusCode: 400,
            message: 'Validation failed',
            errors: {
                [location]: {
                    [field]: message
                }
            }
        });
    }

    // ORM error: unique violation (e.g. Postgres 23505)
    if (
        error instanceof Error &&
        "code" in error &&
        typeof (error as any).code === "string"
    ) {
        const ormError = error as any;

        if (ormError.code === "23505") {
            const detail: string = ormError.detail || "";
            const match = detail.match(/\((.+?)\)=\((.+?)\)/);
            const field = match?.[1].replaceAll("\"", "'");
            const value = match?.[2];

            return reply.status(409).send({
                statusCode: 409,
                error: "Conflict",
                message: field && value
                    ? `Já existe um registro com ${field} = ${value}`
                    : "Registro já existe."
            });
        }
    }

    // Default 500 fallback
    return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: error.message.replaceAll("\\", "'") || 'Erro interno do servidor'
    });
};
