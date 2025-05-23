import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"
import { loginSchema, loginResponseSchema } from "./auth.schema"

export async function authRoutes(app: FastifyInstance) {
    app.post(
        '/login',
        {
            schema: {
                body: loginSchema,
                response: {
                    201: loginResponseSchema,
                },
            },
        },
        () => { },
    )
    app.delete('/logout', () => { })

    // 
    app.log.info('user routes registered')
}