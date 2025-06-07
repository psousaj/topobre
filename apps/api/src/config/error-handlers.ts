import type { FastifyInstance } from "fastify"
import { ZodError } from "zod"
import { logger } from "../config/logger";

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
    logger.error(error);

    // Erros de validação
    if (error instanceof ZodError) {
        return reply.status(400).send({
            statusCode: 400,
            message: 'Invalid input',
            errors: error.flatten().fieldErrors
        });
    }

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

    if (
        error instanceof Error &&
        "code" in error &&
        typeof (error as any).code === "string"
    ) {
        const ormError = error as any;

        if (ormError.code === "23505") {
            const detail: string = ormError.detail || "";

            // Tenta extrair os campos e valores da mensagem
            const match = detail.match(/\((.+?)\)=\((.+?)\)/);
            const field = match?.[1].replaceAll("\"", "\'");
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

    if (error instanceof Error) {
        return reply.status(500).send({
            statusCode: 500,
            error: 'Internal Server Error',
            message: error.message.replaceAll("\\", "'")
        });
    }

    return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Erro interno do servidor'
    });
};