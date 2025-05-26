import { z } from "zod";

const badRequestResponseSchema = z.object({
    statusCode: z.literal(400).optional(),
    message: z.string()
})
const conflictErrorResponseSchema = z.object({
    statusCode: z.literal(409).optional(),
    message: z.string()
})
const notFoundErrorResponseSchema = z.object({
    statusCode: z.literal(404).optional(),
    message: z.string()
})

export {
    badRequestResponseSchema,
    conflictErrorResponseSchema,
    notFoundErrorResponseSchema
}
