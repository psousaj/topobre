import { z } from "zod";

const badRequestResponseSchema = z.object({
    statusCode: z.number().default(400),
    error: z.string().default("Bad Request"),
    message: z.string()
})
const conflictErrorResponseSchema = z.object({
    statusCode: z.number().default(409),
    error: z.string().default("Conflict"),
    message: z.string()
})
const notFoundErrorResponseSchema = z.object({
    statusCode: z.number().default(404),
    error: z.string().default("Not Found"),
    message: z.string()
})
const unauthorizedErrorResponseSchema = z.object({
    statusCode: z.number().default(401),
    error: z.string().default("Unauthorized"),
    message: z.string()
})
const forbiddenErrorResponseSchema = z.object({
    statusCode: z.number().default(403),
    error: z.string().default("Forbidden"),
    message: z.string()
})

const previewQuerySchema = z.object({
    template: z.string().describe('The name of the template to preview'),
}).passthrough(); // <- permite outros params arbitrários

export {
    badRequestResponseSchema,
    conflictErrorResponseSchema,
    notFoundErrorResponseSchema,
    unauthorizedErrorResponseSchema,
    forbiddenErrorResponseSchema,
    previewQuerySchema
}
