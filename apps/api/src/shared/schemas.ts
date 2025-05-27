import { z } from "zod";

const badRequestResponseSchema = z.object({
    statusCode: z.number().default(400),
    message: z.string()
})
const conflictErrorResponseSchema = z.object({
    statusCode: z.number().default(409),
    message: z.string()
})
const notFoundErrorResponseSchema = z.object({
    statusCode: z.number().default(404),
    message: z.string()
})
const unauthorizedErrorResponseSchema = z.object({
    statusCode: z.number().default(401),
    message: z.string()
})
const forbiddenErrorResponseSchema = z.object({
    statusCode: z.number().default(403),
    message: z.string()
})

export {
    badRequestResponseSchema,
    conflictErrorResponseSchema,
    notFoundErrorResponseSchema,
    unauthorizedErrorResponseSchema,
    forbiddenErrorResponseSchema
}
